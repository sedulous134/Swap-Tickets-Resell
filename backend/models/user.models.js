import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        // required: true,
        unique:true,
        lowercase: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      index: true,
      match: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
    },
    googleId: {
      type: String,
      unique: true,
      required: true// ✅ allows multiple null values with unique index
    },  
    
    
    // fullName:{
    //     type: String,
    //     required: [true,"fullname is required"],
    //     trim:true,
    // },
    password: {
      type: String,  
      match: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
      required: function() { // Only require password for regular users, not Google login users
        return this.googleId ? false : true;
      },
    },
    profilePic: {
       type: String,
      default: "",
},
    
    // phoneNumber:{
    //     type:String,
    //     required: true,
    //     // match:"^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$"
    // },
    // categories:{
    //     type:String,
    //     enum:["Buyer","Seller"],
    //     required:true,
    //     default: "Buyer"
    // },
    refreshToken: {
      type: String,
      default: null,
    },
    
},{timestamps:true}) 


userSchema.pre("save",async function (next) {
    if(this.isModified("password")){
        this.password= await bcrypt.hash(this.password,10)
      }
      next()
})

userSchema.methods.ispasswordcorrect = async function(password){
  return await bcrypt.compare(password, this.password) // bcrypt can also compare and return true or false
} 

userSchema.pre("save", function (next) {
  if (!this.userName) {
    this.userName = this.email.split("@")[0]; // ✅ Use the first part of email as username
  }
  next();
});


userSchema.methods.generateaccesstoken = function(){
    return jwt.sign(
      //  Paylaod
      {
        _id : this._id,
        email: this.email,
        userName: this.userName,
        // fullName: this.fullName
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
      }
    )
  }
  userSchema.methods.generaterefreshtoken = function(){
    return jwt.sign(
      {
        _id : this._id
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY,
      }
    )
  }
  

export const User = mongoose.model("User",userSchema);