import 'dotenv/config'
import app from './app.js'
import mongoose from 'mongoose'

const PORT = process.env.PORT || 4000
const MONGO_URI = process.env.MONGO_URI

// Start server immediately so Render / Vercel health checks pass without waiting for Mongo
app.listen(PORT, () => {
  console.log(`[AniTrack Server] Running on port :${PORT}`)
})

if (MONGO_URI) {
  mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  }).then(() => {
    console.log('[AniTrack Server] Successfully connected to MongoDB Database')
  }).catch(err => {
    console.warn('[AniTrack Server] MongoDB connection failed. Running with in-memory resilient fallback:', err.message)
  })
} else {
  console.log('[AniTrack Server] No MONGO_URI provided. Running in resilient mock/in-memory mode.')
}
