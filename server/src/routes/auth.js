import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

const router=express.Router()
const JWT_SECRET=process.env.JWT_SECRET||'dev-secret'

function sign(user){
  return jwt.sign({sub:user._id,username:user.username},JWT_SECRET,{expiresIn:'7d'})
}

router.post('/register',async(req,res,next)=>{
  try{
    const {email,username,password}=req.body
    if(!email||!username||!password) return res.status(400).json({error:'Missing fields'})
    const passwordHash=await bcrypt.hash(password,10)
    const user=await User.create({email,username,passwordHash})
    res.json({token:sign(user),user:{id:user._id,email:user.email,username:user.username}})
  }catch(err){
    if(err.code===11000) return res.status(409).json({error:'Email or username exists'})
    next(err)
  }
})

router.post('/login',async(req,res,next)=>{
  try{
    const {email,password}=req.body
    const user=await User.findOne({email})
    if(!user) return res.status(401).json({error:'Invalid credentials'})
    const ok=await bcrypt.compare(password,user.passwordHash)
    if(!ok) return res.status(401).json({error:'Invalid credentials'})
    res.json({token:sign(user),user:{id:user._id,email:user.email,username:user.username}})
  }catch(err){next(err)}
})

export default router


