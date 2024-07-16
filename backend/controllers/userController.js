import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs"
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

//Get User Profile
const getUserProfile = async (req, res) => {
    const { query } = req.params;

    // We will fetch user  profile either with usrname or userid
    // Querry is either username or userid 

    try {
        let user;
        if (mongoose.Types.ObjectId.isValid(query)) {
            user = await User.findOne({ _id: query }).select("-password").select("-updatedAt");
        } else {
            //Query is username
            user = await User.findOne({ username: query }).select("-password").select("-updatedAt");
        }

        if (!user) return res.status(400).json({ error: "User Not Found" })

        res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json({ error: err.message })
        console.log("Error in Getting User Profile", err.message)
    }
}

//SignUp User
const signupUser = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;
        const user = await User.findOne({ $or: [{ email }, { username }] });

        if (user) {
            return res.status(400).json({ error: "User already Exists" })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name, email, username, password: hashedPassword,
        });

        await newUser.save();

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res)
            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                bio: newUser.bio,
                profilePic: newUser.profilePic
            })
        } else {
            res.status(400).json({ error: "Invalid User Data" })
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message })
        console.log("Error in signupUser", err.message)
    }
}

//User Login
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) return res.status(400).json({ error: "Invalid username or password " });

        if (user.isFrozen) {
            user.isFrozen = false;
            await user.save();
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            message: "Successfully Loged In",
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio,
            profilePic: user.profilePic,
        })

    }
    catch (err) {
        res.status(500).json({ error: err.message })
        console.log("Error in LoginUser", err.message)
    }
}

//User Logout
const logoutUser = (_req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 1 });
        res.status(200).json({ message: "User Logged out Successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message })
        console.log("Error in Logout User", err.message)
    }

}

// Follow or UnFollow
const followUnFollowedUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (id === req.user._id.toString()) return res.status(400).json({ error: "You cannot follow/unfollow yourself" });

        if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            //Unfollow User 
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            res.status(200).json({ message: "User unfollowed Successfully" })
        }
        else {
            //Follow User 
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } })
            res.status(200).json({ message: "User followed Successfully" })
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message })
        console.log("Error in Follow or Unfollow", err.message)
    }
}

//Update user 
const updateUser = async (req, res) => {
    const { name, email, username, password, bio } = req.body;
    let { profilePic } = req.body;
    const userId = req.user._id;

    try {
        let user = await User.findById(userId);
        if (!user) return res.status(400).json({ error: "User not found" });

        if (req.params.id !== userId.toString()) return res.status(400).json({ error: "You can't Update other's Profile" })


        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        if (profilePic) {
            if (user.profilePic) {
                await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
            }

            const uploadedResponse = await cloudinary.uploader.upload(profilePic);
            profilePic = uploadedResponse.secure_url;
        }


        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        user = await user.save();

        // Update username and profile picture in user replies in posts
        await Post.updateMany(
            { "replies.userId": userId },
            {
                $set: {
                    "replies.$[reply].username": user.username,
                    "replies.$[reply].userProfilePic": user.profilePic,
                },
            },
            { arrayFilters: [{ "reply.userId": userId }] }

        );

        //Password should be null in response
        user.password = null;
        res.status(200).json(user)
    }
    catch (err) {
        res.status(500).json({ error: err.message })
        console.log("Error in Update User", err.message)
    }
}

const getSuggestedUsers = async (req, res) => {
    try {
        //Exclude the current user from the suggested users array, excludes users that are current users that current user is already

        const userId = req.user._id;

        const usersFollowedByYou = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId },
                },
            },
            {
                $sample: { size: 10 },
            },
        ]);

        const filteredUsers = users.filter((user) => !usersFollowedByYou.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 4);

        suggestedUsers.forEach((user) => (user.password = null));

        res.status(200).json(suggestedUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const freezeAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(400).json({ error: "User not Found" })
        }
        user.isFrozen = true;
        await user.save()

        res.status(200).json({ success: true })
    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
}
export { signupUser, loginUser, logoutUser, followUnFollowedUser, updateUser, getUserProfile, getSuggestedUsers, freezeAccount };