import mongoose from 'mongoose'

const clubSchema=new mongoose.Schema({
  name:{type:String,required:true,trim:true},
  description:{type:String,default:''},
  isPrivate:{type:Boolean,default:false},
  ownerId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
  tags:{type:[String],default:[]},
  createdAt:{type:Date,default:Date.now}
},{versionKey:false})

clubSchema.index({name:1},{unique:false})

export default mongoose.model('Club',clubSchema)


