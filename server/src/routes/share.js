import express from 'express'
import crypto from 'crypto'
import ShareLink from '../models/ShareLink.js'
import WatchlistItem from '../models/WatchlistItem.js'
import { requireAuth } from '../middleware/auth.js'

const router=express.Router()

router.post('/',requireAuth,async(req,res,next)=>{
  try{
    const token=crypto.randomBytes(10).toString('hex')
    const vis=(req.body?.visibility==='public')?'public':'unlisted'
    const link=await ShareLink.create({ownerId:req.user.id,token,visibility:vis})
    res.json({link:{token:link.token,visibility:link.visibility}})
  }catch(err){next(err)}
})

router.get('/:token',async(req,res,next)=>{
  try{
    const {token}=req.params
    const link=await ShareLink.findOne({token}).lean()
    if(!link) return res.status(404).json({error:'Not found'})
    const items=await WatchlistItem.find({userId:link.ownerId}).select('-_id showId title poster status watchedEpisodes totalEpisodes type year').lean()
    res.json({ownerId:link.ownerId,visibility:link.visibility,items})
  }catch(err){next(err)}
})

export default router


