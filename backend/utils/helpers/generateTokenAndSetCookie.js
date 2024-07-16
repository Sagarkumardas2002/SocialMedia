import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '90d'
    }
    )
    res.cookie("jwt", token, {
        httpOnly: true, //this cookie can't be accessed by the user 
        maxAge: 90 * 24 * 60 * 60 * 1000, //90 days 
        sameSite: "strict",
    })
    return token;
}
export default generateTokenAndSetCookie;
