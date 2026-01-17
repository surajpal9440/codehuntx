const mongoose=require('mongoose');
const {Schema}=mongoose;

const userSchema = new Schema({
    firstName:{
        type:String,
        required:true,
        minlength:3,
        maxlength:20
    },
    lastName:{
        type:String,
        required:false,
        minlength:3,
        maxlength:20
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        immutable:true
    },
    age:{
        type:Number,
        min:5,
        max:80
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problem',
            unique:true,
        }],
       
    },
    password:{
        type:String,
        required:true
    },

    //for googleAuth
    // Add this to your existing userSchema
   googleId: {
        type: String,
        required: false
    }

},{timestamps:true})

userSchema.post('findOneAndDelete',async function (userInfo) {
    if(userInfo){
        await mongoose.model('submission').deleteMany({
            userInfo,userInfo,_id})
    }
})
const User =mongoose.model("user",userSchema);
module.exports=User;