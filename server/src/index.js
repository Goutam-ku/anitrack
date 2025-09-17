import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import mongoose from 'mongoose'
import authRouter from './routes/auth.js'
import showsRouter from './routes/shows.js'
import watchlistRouter from './routes/watchlist.js'

const app=express()
app.use(helmet())
app.use(cors({origin:(origin,cb)=>cb(null,true),credentials:true}))
app.use(express.json({limit:'1mb'}))
app.use(morgan('dev'))

app.get('/',(req,res)=>res.json({ok:true,name:'anitrack-server'}))
app.use('/api/auth',authRouter)
app.use('/api/shows',showsRouter)
app.use('/api/watchlist',watchlistRouter)

app.use((err,req,res,next)=>{
  console.error(err)
  res.status(err.status||500).json({error:err.message||'Server error'})
})

const PORT=process.env.PORT||4000
const MONGO_URI=process.env.MONGO_URI||'mongodb://127.0.0.1:27017/anitrack'
mongoose.connect(MONGO_URI).then(()=>{
  app.listen(PORT,()=>console.log(`server on :${PORT}`))
}).catch(err=>{
  console.error('Mongo connect error',err)
  process.exit(1)
})


