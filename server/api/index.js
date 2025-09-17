import 'dotenv/config'
import mongoose from 'mongoose'
import app from '../src/app.js'

export default async function handler(req,res){
  try{
    if(mongoose.connection.readyState===0){
      await mongoose.connect(process.env.MONGO_URI)
    }
  }catch(e){
    console.error('Mongo connect error',e)
    res.status(500).json({error:'DB connection failed'})
    return
  }
  app(req,res)
}


