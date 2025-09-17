import express from 'express'
import Club from '../models/Club.js'
import { requireAuth } from '../middleware/auth.js'

const router=express.Router()

// Public list
router.get('/',async(req,res,next)=>{
  try{
    const q=(req.query.q||'').toString().toLowerCase()
    const filter=q?{name:{$regex:q,$options:'i'}}:{}
    const items=await Club.find(filter).sort({createdAt:-1}).limit(100).lean()
    res.json({items})
  }catch(err){next(err)}
})

// Create (auth)
router.post('/',requireAuth,async(req,res,next)=>{
  try{
    const {name,description,isPrivate,tags}=req.body
    if(!name) return res.status(400).json({error:'Name required'})
    const club=await Club.create({name,description:isPrivate?description||'':(description||''),isPrivate:!!isPrivate,ownerId:req.user.id,tags:tags||[]})
    res.json({club})
  }catch(err){next(err)}
})

export default router


