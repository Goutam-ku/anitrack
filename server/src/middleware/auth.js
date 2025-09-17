import jwt from 'jsonwebtoken'

const JWT_SECRET=process.env.JWT_SECRET||'dev-secret'

export function requireAuth(req,res,next){
  try{
    const hdr=req.headers.authorization||''
    const token=hdr.startsWith('Bearer ')?hdr.slice(7):null
    if(!token) return res.status(401).json({error:'Unauthorized'})
    const payload=jwt.verify(token,JWT_SECRET)
    req.user={id:payload.sub,username:payload.username}
    next()
  }catch(err){
    return res.status(401).json({error:'Unauthorized'})
  }
}


