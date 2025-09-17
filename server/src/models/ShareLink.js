import mongoose from 'mongoose'

const schema=new mongoose.Schema({
  ownerId:{type:mongoose.Schema.Types.ObjectId,ref:'User',index:true,required:true},
  token:{type:String,unique:true,index:true,required:true},
  visibility:{type:String,enum:['public','unlisted'],default:'unlisted'},
  createdAt:{type:Date,default:Date.now}
},{versionKey:false})

export default mongoose.model('ShareLink',schema)


