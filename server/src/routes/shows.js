import express from 'express'
import axios from 'axios'

const router=express.Router()

// Use Jikan (Unofficial MAL API) for dummy anime data
// Docs: https://docs.api.jikan.moe

router.get('/',async(req,res,next)=>{
  try{
    const q=req.query.q||'top'
    let url='https://api.jikan.moe/v4/top/anime?limit=24'
    if(q && q!=='top') url=`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=24`
    const {data}=await axios.get(url,{timeout:15000})
    const items=(data?.data||[]).map(a=>({
      id:a.mal_id,
      title:a.title,
      synopsis:a.synopsis,
      year:a.year,
      type:(a.type||'Anime').toLowerCase(),
      episodes:a.episodes||0,
      rating:a.score||null,
      poster:a.images?.jpg?.large_image_url||a.images?.jpg?.image_url
    }))
    res.json({items})
  }catch(err){next(err)}
})

// Dummy playlists/videos: return sample HLS links (public test streams)
router.get('/:id/playlist',async(req,res)=>{
  const sample=[
    {id:'ep1',title:'Episode 1',hls:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'},
    {id:'ep2',title:'Episode 2',hls:'https://test-streams.mux.dev/pts_shift/master.m3u8'}
  ]
  res.json({items:sample})
})

// Details by id
router.get('/:id',async(req,res,next)=>{
  try{
    const {id}=req.params
    const {data}=await axios.get(`https://api.jikan.moe/v4/anime/${id}`,{timeout:15000})
    const a=data?.data
    if(!a) return res.status(404).json({error:'Not found'})
    const item={
      id:a.mal_id,
      title:a.title,
      synopsis:a.synopsis,
      year:a.year,
      type:(a.type||'Anime').toLowerCase(),
      episodes:a.episodes||0,
      rating:a.score||null,
      poster:a.images?.jpg?.large_image_url||a.images?.jpg?.image_url
    }
    res.json({item})
  }catch(err){next(err)}
})

export default router


