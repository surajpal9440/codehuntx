const express = require('express');

const authRouter = express.Router(); 
const passport = require('passport');

// 🚀 FIX: Destructured generateToken from the controller
const {register,login,logout,adminRegister, deleteProfile, generateToken} = require('../controllers/userAuthenticate') 
const userMiddleWare= require('../middleware/userMiddleware')
const adminMiddleWare =require('../middleware/adminMiddleWare')

//Register
authRouter.post('/register',register);
authRouter.post('/admin/register',adminMiddleWare,adminRegister);

//login
authRouter.post('/login',login);
//logout
authRouter.post('/logout',userMiddleWare,logout);
// delete Profile
authRouter.delete('/delete/profile',userMiddleWare,deleteProfile);

// getprofile
authRouter.get('/checkAuth',userMiddleWare,(req,res)=>{ 
    const reply={
        firstName:req.result.firstName,
        emailId:req.result.emailId,
        _id:req.result._id,
        role:req.result.role,
    }
    res.status(201).json({
        user:reply,
        message:"valid user"
    })
})

// Trigger Google Login
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback route
authRouter.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // 🚀 Fixed: generateToken is now defined because it is imported at the top
    const token = generateToken(req.user._id);
    
    // Send token to frontend (Redirect with token or use Cookies)
    res.redirect(`http://localhost:5173/login-success?token=${token}`);
  }
);

module.exports=authRouter;