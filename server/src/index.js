import 'dotenv/config'
import app from './app.js'
import mongoose from 'mongoose'


const PORT=process.env.PORT||4000
const MONGO_URI=process.env.MONGO_URI||'mongodb://127.0.0.1:27017/anitrack'
mongoose.connect(MONGO_URI).then(()=>{
  app.listen(PORT,()=>console.log(`server on :${PORT}`))
}).catch(err=>{
  console.error('Mongo connect error',err)
  process.exit(1)
})


