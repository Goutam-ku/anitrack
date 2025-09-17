import express from 'express'
import WatchlistItem from '../models/WatchlistItem.js'
import { requireAuth } from '../middleware/auth.js'

const router=express.Router()
router.use(requireAuth)

router.get('/',async(req,res,next)=>{
  try{
    const items=await WatchlistItem.find({userId:req.user.id}).lean()
    res.json({items})
  }catch(err){next(err)}
})

router.post('/',async(req,res,next)=>{
  try{
    const body=req.body
    const item=await WatchlistItem.findOneAndUpdate(
      {userId:req.user.id,showId:body.showId},
      {$set:{...body,userId:req.user.id,updatedAt:new Date()}},
      {new:true,upsert:true}
    )
    res.json({item})
  }catch(err){next(err)}
})

router.patch('/:showId',async(req,res,next)=>{
  try{
    const {showId}=req.params
    const updates=req.body
    const item=await WatchlistItem.findOneAndUpdate(
      {userId:req.user.id,showId},
      {$set:{...updates,updatedAt:new Date()}},
      {new:true}
    )
    if(!item) return res.status(404).json({error:'Not found'})
    res.json({item})
  }catch(err){next(err)}
})

router.delete('/:showId',async(req,res,next)=>{
  try{
    const {showId}=req.params
    await WatchlistItem.deleteOne({userId:req.user.id,showId})
    res.json({ok:true})
  }catch(err){next(err)}
})

export default router


