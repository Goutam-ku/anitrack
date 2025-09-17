import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import authRouter from './routes/auth.js'
import showsRouter from './routes/shows.js'
import watchlistRouter from './routes/watchlist.js'
import clubsRouter from './routes/clubs.js'
import shareRouter from './routes/share.js'

const app=express()
app.use(helmet())
app.use(cors({origin:(origin,cb)=>cb(null,true),credentials:true}))
app.use(express.json({limit:'1mb'}))
app.use(morgan('dev'))

app.get('/',(req,res)=>res.json({ok:true,name:'anitrack-server'}))

// Mount with and without /api prefix for serverless compatibility
app.use('/api/auth',authRouter)
app.use('/api/shows',showsRouter)
app.use('/api/watchlist',watchlistRouter)
app.use('/api/clubs',clubsRouter)
app.use('/api/share',shareRouter)

app.use('/auth',authRouter)
app.use('/shows',showsRouter)
app.use('/watchlist',watchlistRouter)
app.use('/clubs',clubsRouter)
app.use('/share',shareRouter)

app.use((err,req,res,next)=>{
  console.error(err)
  res.status(err.status||500).json({error:err.message||'Server error'})
})

export default app


