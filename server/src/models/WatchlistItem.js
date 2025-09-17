import mongoose from 'mongoose'

const schema=new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',index:true,required:true},
  showId:{type:String,required:true}, // MAL/Jikan id or external id
  title:{type:String,required:true},
  poster:{type:String},
  status:{type:String,enum:['watching','completed','on_hold','dropped','plan'],default:'plan',index:true},
  watchedEpisodes:{type:Number,default:0},
  totalEpisodes:{type:Number,default:0},
  type:{type:String,default:'anime'},
  year:{type:Number},
  rating:{type:Number},
  updatedAt:{type:Date,default:Date.now}
},{versionKey:false})

schema.index({userId:1,showId:1},{unique:true})

export default mongoose.model('WatchlistItem',schema)


