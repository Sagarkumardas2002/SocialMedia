import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import { v2 as cloudinary } from "cloudinary"
//create Post
const createPost = async (req, res) => {
    try {
        const { postedBy, text } = req.body;
        let { img } = req.body;

        if (!postedBy || !text) {
            return res.status
                (400).json({ error: "PostedBy and text fields are required" })
        }

        const user = await User.findById(postedBy);
        if (!user) {
            return res.status(400).json({ error: "User not Found" })
        }

        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Unautherized to create post" })
        }
        const maxLength = 500;
        if (text.length > maxLength) {
            return res.status(400).json({ error: `Text must be less than ${maxLength} characters ` })
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({ postedBy, text, img });
        await newPost.save();

        res.status(201).json(newPost)

    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }
}

//get Post
const getPost = async (req, res) => {
    try {

        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json({ error: "Post Not Found" })
        }
        res.status(200).json(post);
    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }
}

//Delete Post
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post Not found" });
        }

        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Unauthorized to delete post" });
        }

        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId)
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Post deleted Successfully" })
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}

//Like and Unlike Post
const likesUnlikePost = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post Not Found" });
        }

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            //Unlike Post
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } })
            res.status(200).json({ message: "Post Unliked Successfully" });
        }

        else {
            //Like Post
            post.likes.push(userId);
            await post.save()
            res.status(200).json({ message: "Post Liked Successfully" });
        }

    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }
}

//Reply to the post
const replyToPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        const userProfilePic = req.user.profilePic;
        const username = req.user.username;

        if (!text) {
            return res.status(400).json({ error: "Text Field is required" })
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post Not Found" })
        }

        const reply = { userId, text, userProfilePic, username, post }

        post.replies.push(reply);
        await post.save();

        res.status(200).json(reply)
    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const getFeedPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User Not Found" })
        }
        const following = user.following;

        const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 })

        res.status(200).json(feedPosts);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getUserPosts = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(404).json({ error: "User not Foud" })
        }
        const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 })
        res.status(200).json(posts);
    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export { createPost, getPost, deletePost, likesUnlikePost, replyToPost, getFeedPosts, getUserPosts };