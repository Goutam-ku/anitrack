import mongoose from 'mongoose'

const userSchema=new mongoose.Schema({
  email:{type:String,unique:true,required:true,lowercase:true,trim:true},
  username:{type:String,unique:true,required:true,trim:true},
  passwordHash:{type:String,required:true},
  createdAt:{type:Date,default:Date.now}
},{versionKey:false})

export default mongoose.model('User',userSchema)


