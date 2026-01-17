const redisClient = require('../config/redis');
const User = require('../models/user');
const validate = require('../utils/validator')
const bcrypt = require('bcrypt');
const jwt =require('jsonwebtoken');
const Submission = require('../models/submission');
// const { use } = require('react');

// 🚀 Added: Helper function for JWT generation
const generateToken = (userId) => {
    return jwt.sign(
        { _id: userId }, 
        process.env.JWT_KEY, // Matches your process.env.JWT_KEY logic below
        { expiresIn: "7d" }
    );
};

const register = async (req, res) => {

    console.log("📌 REGISTER endpoint triggered");
    console.log("📥 Received body:", req.body);

    try {
        //validate the data 
        validate(req.body);

        const { firstName, emailId, password } = req.body;

        console.log("🔐 Hashing password...");
        req.body.password = await bcrypt.hash(password, 10);

        req.body.role = 'user';

        console.log("📝 Creating user in DB...");

        const user = await User.create(req.body);

        console.log("✅ User created:", user);

        const token = jwt.sign(
            { _id: user._id, emailId: emailId, role: 'user' },
            process.env.JWT_KEY,
            { expiresIn: 60 * 60 }
        );

        res.cookie('token', token, {
     httpOnly: true,
     secure: false,      // set true in production (only with HTTPS)
     sameSite: 'lax',    // 'lax' good for local dev; change to 'none' + secure:true for production cross-site
     maxAge: 60 * 60 * 1000
    });

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
        };

        return res.status(201).json({
            user: reply,
            message: "Registered successfully"
        });

    } catch (err) {
        console.log("❌ REGISTER ERROR LOGGED BELOW:");
        console.log(err);   // FULL RAW ERROR

        return res.status(400).json({
            message: "Registration Failed",
            details: err.message,
            name: err.name,
            code: err.code,
            errors: err.errors,  // mongoose validation
            keyValue: err.keyValue // duplicate keys
        });
    }
};


//login
const login = async (req,res)=>{

    try{
        const{emailId,password} =req.body; //This extracts the emailId and password sent by the user from the request body.

        //if emailid and password wrong hai to error throw krega
        if(!emailId) //if 
            throw new Error("Invalid Credentials");
        if(!password)
            throw new Error("Invalid Credentails");

        //else uss user ko dhund ke layega system pe exist krta hai vo email
        const user = await User.findOne({emailId}); 
        if(!user) throw new Error("Invalid Credentials");
        //user apna password dalega login ke timme so password compare krenge db me
        
        const match = await bcrypt.compare(password,user.password) //dono password ko compare karenge
        //bcrypt.compare() checks whether the plain password entered by the user matches the hashed password stored in the database.
      
        if(!match)
            throw new Error("Invalid Credentials");



        //else : agar password match ho gya
        const token = jwt.sign({_id:user._id,emailId:emailId,role:user.role},process.env.JWT_KEY,{expiresIn:60*60}) //This creates a JWT (JSON Web Token) for the logged-in user.
        const reply= {
            firstName:user.firstName,
            emailId:user.emailId,
            _id:user._id,
            role:user.role,
        }
       res.cookie('token', token, {
        httpOnly: true,
        secure: false,      // set true in production (only with HTTPS)
        sameSite: 'lax',    // 'lax' good for local dev; change to 'none' + secure:true for production cross-site
        maxAge: 60 * 60 * 1000
        });
        //yaha pe changes kiye bad me aake ,user login successfull nhi bhejenge sirf ,uske sath user ki info bhi bhejenge jb user login hoga tb

        res.status (201).json({
            user:reply,
            message:"Login Successful"
        });
            

    }
    catch(err){
        res.status(401).json({ message: "Error", details: err?.message || String(err) });
    }
}

//logout 
const logout = async (req,res)=>{
    try{
      //validate the token --> isko routes folder-->userAuth.js me hi likha hai


      const {token} =req.cookies;  //token ko cookies se nikala ,usko pehle hi validate kr chuke hai
      if(!token){
        return res.status(400).json({ message: "No token provided" });
      }
      
      const payload = jwt.decode(token);  //payload ke andr sb info hogi and uski expiry bhi hogi
      if(!payload || !payload.exp){
        // clear cookie anyway
        res.cookie("token",null,{expires: new Date(Date.now())});
        return res.status(400).json({ message: "Invalid token" });
      }

      //ab logout krna hai to ye token ko add krna padega redis ke blocklist me
      //token add kar dunga redis ke blocklist me
      await redisClient.set(`token:${token}`,'Blocked');
     await redisClient.expireAt(`token:${token}`, Math.floor(payload.exp));

      //cookies ko clear k dena 
      res.cookie("token",null,{expires: new Date(Date.now())});
      res.send("Logged Out Successfully"); 
    }
catch(err){
  res.status(503).json({ message: "Error", details: err?.message || String(err) });
}}

//adminRegister
const adminRegister =async (req,res)=>{
    //normal user ka code hai but role ke jagah admin daal denge like role:'admin'
    
    try{
        //validate the data 
        // validate(req.body);

        const {firstName, emailId, password}=req.body;
        //Replaces req.body.password with the hashed password so you never store plain text
        req.body.password=await bcrypt.hash(password,10);  //password ko hash me covert krrenge
        req.body.role='admin';             
       const user = await User.create(req.body); //Calls your User model (likely a Mongoose model) to create a new user document in the database using req.body.

                                                         //node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  ye use kiya hai token generate krne ke liye and ye token ko .env me rakhenge
                                                         //role:user.role --> means admin ke pass hi dono power hai ki kya banana hai admin ya user
       const token = jwt.sign({_id:user._id,emailId:emailId ,role:user.role},process.env.JWT_KEY,{expiresIn:60*60})
       res.cookie('token',token,{maxAge:60*60*1000});
       res.status (201).send("user registered successfully");
    }
    catch(err){
        res.status(400).json({ message: "Error", details: err?.message || String(err) });
    }
}

//deleteProfile
const deleteProfile = async (req , res)=>{
    try{
      const userId = req.result._id;
      //userScema se delete kiya 
      await User.findByIdAndDelete(userId);

      //ab submission schema wale se bhi krenge
      await Submission.deleteMany({userId})

      res.status(200).send("Deleted Successfully")

    }
    catch(err){
        res.status(400).json({ message: "error", details: err?.message || String(err) });
    }
}
// 🚀 Added: generateToken to the exports
module.exports ={register,login,logout,adminRegister, deleteProfile, generateToken}