const validator = require('validator');

//req.body me data aayega 
 
const validate = (data)=>{  //ye validate function hai controllers folder me userAuthenticate se call hoga

    const mandatoryField = ['firstName','emailId','password'];

    const IsAllowed = mandatoryField.every((k)=>Object.keys(data).includes(k));

    if(!IsAllowed)
        throw new Error("Some field is missing");

    if(!validator.isEmail(data.emailId))
        throw new Error("Invalid Email");

    if(!validator.isStrongPassword(data.password))
        throw new Error("Weak Password");
}

module.exports=validate;