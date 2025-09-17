import React from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Hls from 'hls.js'

const API_BASE=import.meta.env.VITE_API_BASE||'http://localhost:4000/api'

const AuthContext=React.createContext(null)
function useAuth(){ return React.useContext(AuthContext) }

function Layout({children}){
  const [theme,setTheme]=React.useState(()=>localStorage.getItem('theme')||'dark')
  React.useEffect(()=>{
    const root=document.documentElement
    if(theme==='dark'){root.classList.add('dark')}else{root.classList.remove('dark')}
    localStorage.setItem('theme',theme)
  },[theme])
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-slate-900/70 border-b border-black/10 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="font-bold text-sky-400">AniTrack</Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/browse" className="hover:text-sky-300">Browse</Link>
            <Link to="/watchlist" className="hover:text-sky-300">Watchlist</Link>
            <Link to="/clubs" className="hover:text-sky-300">Clubs</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={()=>setTheme(t=>t==='dark'?'light':'dark')} className="px-3 py-1.5 rounded border border-black/10 dark:border-white/20 text-sm">{theme==='dark'? 'Light':'Dark'} mode</button>
            <AuthButtons />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">{children}</main>
      <footer className="border-t border-black/10 dark:border-white/10 py-6 text-sm text-slate-500 dark:text-slate-400 text-center">Data via Jikan API · Demo only</footer>
    </div>
  )
}

function Browse(){
  const [q,setQ]=React.useState('')
  const [items,setItems]=React.useState([])
  const [loading,setLoading]=React.useState(false)
  const [filters,setFilters]=React.useState({type:'all',genre:'all',year:'all'})
  const [open,setOpen]=React.useState(false)
  const auth=useAuth()
  const [summary,setSummary]=React.useState({watching:0,completed:0,hours:0})
  const fetchItems=async(query)=>{
    setLoading(true)
    const {data}=await axios.get(`${API_BASE}/shows`,{params:{q:query||'top'}})
    setItems(data.items)
    setLoading(false)
  }
  React.useEffect(()=>{fetchItems('top')},[])
  React.useEffect(()=>{
    (async()=>{
      if(!auth?.token){ setSummary({watching:0,completed:0,hours:0}); return }
      try{
        const {data}=await axios.get(`${API_BASE}/watchlist`,{headers:{Authorization:`Bearer ${auth.token}`}})
        const items=data.items||[]
        const watching=items.filter(i=>i.status==='watching').length
        const completed=items.filter(i=>i.status==='completed').length
        const hours=items.reduce((acc,i)=> acc + ((i.watchedEpisodes||0)*24/60), 0)
        setSummary({watching,completed,hours:Math.round(hours)})
      }catch{ setSummary({watching:0,completed:0,hours:0}) }
    })()
  },[auth?.token])
  const genres=React.useMemo(()=>{
    const g=new Set(['All'])
    items.forEach(i=>{
      // Jikan results don't always include genres here; fallback none
      if(i.synopsis){ /* no-op to keep structure */ }
    })
    // Derive genres from titles as placeholder not ideal; keep only All to avoid misleading options
    return Array.from(g)
  },[items])
  const years=React.useMemo(()=>{
    const y=new Set(['All'])
    items.forEach(i=>{ if(i.year) y.add(String(i.year)) })
    return Array.from(y).sort((a,b)=>Number(b)-Number(a))
  },[items])
  const filtered=React.useMemo(()=>{
    return items.filter(i=>{
      if(filters.type!=='all' && String(i.type).toLowerCase()!==filters.type) return false
      if(filters.genre!=='all'){ /* no genre data reliably; skip filtering */ }
      if(filters.year!=='all' && String(i.year)!==filters.year) return false
      return true
    })
  },[items,filters])
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search anime..." className="flex-1 bg-slate-800 border border-white/10 rounded px-3 h-10"/>
        <button onClick={()=>fetchItems(q)} className="px-4 rounded bg-sky-600 hover:bg-sky-500">Search</button>
        <div className="ml-auto relative">
          <button onClick={()=>setOpen(v=>!v)} className="px-3 h-10 rounded border border-white/20 text-sm">Filters</button>
          {open && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 backdrop-blur border border-white/10 rounded p-3 shadow-xl z-20">
              <div className="mb-2 text-sm font-semibold">Filter results</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <label className="text-xs text-slate-400">Type
                  <select value={filters.type} onChange={e=>setFilters(f=>({...f,type:e.target.value}))} className="mt-1 w-full bg-slate-800 border border-white/10 rounded px-2 h-9">
                    <option value="all">All</option>
                    <option value="tv">TV</option>
                    <option value="movie">Movie</option>
                    <option value="ova">OVA</option>
                    <option value="ona">ONA</option>
                    <option value="special">Special</option>
                    <option value="music">Music</option>
                  </select>
                </label>
                <label className="text-xs text-slate-400">Year
                  <select value={filters.year} onChange={e=>setFilters(f=>({...f,year:e.target.value}))} className="mt-1 w-full bg-slate-800 border border-white/10 rounded px-2 h-9">
                    {years.map(y=> <option key={y} value={typeof y==='string'? y.toLowerCase(): y}>{y}</option>)}
                  </select>
                </label>
              </div>
              <label className="block text-xs text-slate-400">Genre
                <select value={filters.genre} onChange={e=>setFilters(f=>({...f,genre:e.target.value}))} className="mt-1 w-full bg-slate-800 border border-white/10 rounded px-2 h-9">
                  {genres.map(g=> <option key={g} value={typeof g==='string'? g.toLowerCase(): g}>{g}</option>)}
                </select>
              </label>
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={()=>{setFilters({type:'all',genre:'all',year:'all'})}} className="px-3 h-9 rounded border border-white/20 text-sm">Clear</button>
                <button onClick={()=>setOpen(false)} className="px-3 h-9 rounded bg-sky-600 hover:bg-sky-500 text-sm">Apply</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <AnalyticsBar total={filtered.length} watching={summary.watching} completed={summary.completed} hours={summary.hours} />
      {loading? <p>Loading...</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map(it=> <Card key={it.id} item={it}/>) }
        </div>
      )}
    </div>
  )
}

function Card({item}){
  return (
    <Link to={`/title/${item.id}`} className="bg-slate-800/60 border border-white/10 rounded overflow-hidden hover:border-sky-500/50">
      <div className="aspect-[3/4] bg-slate-900">
        {item.poster && <img src={item.poster} alt={item.title} className="w-full h-full object-cover"/>}
      </div>
      <div className="p-2">
        <div className="text-sm font-semibold line-clamp-2">{item.title}</div>
        <div className="text-xs text-slate-400">{item.year||'—'} • {String(item.type).toUpperCase()}</div>
      </div>
    </Link>
  )
}

function AnalyticsBar({total,watching,completed,hours}){
  return (
    <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
      <Stat label="Total shows" value={total} />
      <Stat label="Watching" value={watching} />
      <Stat label="Completed" value={completed} />
      <Stat label="Est. hours" value={hours} />
    </div>
  )
}

function Stat({label,value}){
  return (
    <div className="bg-slate-800/60 border border-white/10 rounded px-3 py-2">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}

function Title(){
  const animeId=window.location.pathname.split('/').pop()
  const [item,setItem]=React.useState(null)
  const [eps,setEps]=React.useState([])
  const [current,setCurrent]=React.useState(null)
  const auth=useAuth()
  React.useEffect(()=>{
    (async()=>{
      const {data}=await axios.get(`${API_BASE}/shows/${animeId}`)
      setItem(data.item||null)
      const pl=await axios.get(`${API_BASE}/shows/${animeId}/playlist`)
      setEps(pl.data.items)
      setCurrent(pl.data.items?.[0]||null)
    })()
  },[animeId])
  const addToWatchlist=async()=>{
    if(!auth?.token){ return alert('Login to track progress') }
    await axios.post(`${API_BASE}/watchlist`,{
      showId:String(animeId),
      title:item.title,
      poster:item.poster,
      status:'plan',
      watchedEpisodes:0,
      totalEpisodes:item.episodes||0,
      type:item.type,
      year:item.year
    },{headers:{Authorization:`Bearer ${auth.token}`}})
    window.dispatchEvent(new CustomEvent('watchlist:changed'))
  }
  const incrementWatched=async()=>{
    if(!auth?.token){ return alert('Login to track progress') }
    // Fetch current watchlist item to know current count (lightweight approach: try to update optimistically)
    try{
      // Optimistic: request server to increment (PATCH with computed value would be better server-side; here we GET list and compute)
      const {data}=await axios.get(`${API_BASE}/watchlist`,{headers:{Authorization:`Bearer ${auth.token}`}})
      const existing=(data.items||[]).find(i=>String(i.showId)===String(animeId))
      const total=item.episodes||0
      const next=(existing?.watchedEpisodes||0)+1
      const status = total>0 && next>=total ? 'completed' : 'watching'
      await axios.post(`${API_BASE}/watchlist`,{
        showId:String(animeId),
        title:item.title,
        poster:item.poster,
        status,
        watchedEpisodes: next>total && total>0 ? total : next,
        totalEpisodes: total,
        type:item.type,
        year:item.year
      },{headers:{Authorization:`Bearer ${auth.token}`}})
      window.dispatchEvent(new CustomEvent('watchlist:changed'))
    }catch(e){ console.error(e); alert('Failed to update progress') }
  }
  if(!item) return <p>Loading...</p>
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div>
        {item.poster && <img src={item.poster} alt={item.title} className="w-full rounded border border-white/10"/>}
      </div>
      <div className="md:col-span-2">
        <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
        <p className="text-slate-300 mb-4 whitespace-pre-line">{item.synopsis||'No synopsis.'}</p>
        <div className="flex gap-2 mb-3">
          <button onClick={addToWatchlist} className="px-3 py-1.5 rounded border border-white/20 text-sm">Add to Watchlist</button>
          <button onClick={incrementWatched} className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-sm">+1 Watched</button>
        </div>
        {current && <PrimaryPlayer ep={current} />}
        <h2 className="font-semibold mt-4 mb-2">Episode Playlist</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {eps.map(ep=> (
            <button key={ep.id} onClick={()=>setCurrent(ep)} className={`text-left bg-slate-800/60 border rounded p-2 ${current?.id===ep.id?'border-sky-500':'border-white/10'}`}>
              <div className="font-semibold text-sm mb-1">{ep.title}</div>
              <div className="text-xs text-slate-400">Click to play</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Episode({ep}){
  const videoRef=React.useRef(null)
  React.useEffect(()=>{
    const video=videoRef.current
    if(!video) return
    if(Hls.isSupported()){
      const hls=new Hls()
      hls.loadSource(ep.hls)
      hls.attachMedia(video)
      return ()=>hls.destroy()
    }else{
      video.src=ep.hls
    }
  },[ep.hls])
  return (
    <div className="bg-slate-800/60 border border-white/10 rounded p-2">
      <div className="font-semibold text-sm mb-2">{ep.title}</div>
      <video ref={videoRef} controls className="w-full aspect-video rounded bg-black"/>
    </div>
  )
}

function PrimaryPlayer({ep}){
  const videoRef=React.useRef(null)
  React.useEffect(()=>{
    const video=videoRef.current
    if(!video) return
    if(Hls.isSupported()){
      const hls=new Hls()
      hls.loadSource(ep.hls)
      hls.attachMedia(video)
      video.play?.().catch(()=>{})
      return ()=>hls.destroy()
    }else{
      video.src=ep.hls
      video.play?.().catch(()=>{})
    }
  },[ep.hls])
  return (
    <div className="bg-slate-800/60 border border-white/10 rounded p-2">
      <div className="font-semibold text-sm mb-2">{ep.title}</div>
      <video ref={videoRef} controls autoPlay className="w-full aspect-video rounded bg-black"/>
    </div>
  )
}

function Login(){
  const auth=useAuth()
  const nav=useNavigate()
  const [email,setEmail]=React.useState('')
  const [password,setPassword]=React.useState('')
  const [error,setError]=React.useState('')
  const submit=async()=>{
    try{
      const {data}=await axios.post(`${API_BASE}/auth/login`,{email,password})
      auth.login(data.token)
      nav('/')
    }catch(e){setError(e.response?.data?.error||'Login failed')}
  }
  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {error && <div className="mb-2 text-rose-400 text-sm">{error}</div>}
      <input className="w-full mb-2 bg-slate-800 border border-white/10 rounded px-3 h-10" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full mb-4 bg-slate-800 border border-white/10 rounded px-3 h-10" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={submit} className="w-full px-4 py-2 rounded bg-sky-600 hover:bg-sky-500">Sign in</button>
    </div>
  )
}

function Register(){
  const nav=useNavigate()
  const [email,setEmail]=React.useState('')
  const [username,setUsername]=React.useState('')
  const [password,setPassword]=React.useState('')
  const [error,setError]=React.useState('')
  const submit=async()=>{
    try{
      await axios.post(`${API_BASE}/auth/register`,{email,username,password})
      nav('/login')
    }catch(e){setError(e.response?.data?.error||'Register failed')}
  }
  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create account</h1>
      {error && <div className="mb-2 text-rose-400 text-sm">{error}</div>}
      <input className="w-full mb-2 bg-slate-800 border border-white/10 rounded px-3 h-10" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full mb-2 bg-slate-800 border border-white/10 rounded px-3 h-10" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
      <input className="w-full mb-4 bg-slate-800 border border-white/10 rounded px-3 h-10" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={submit} className="w-full px-4 py-2 rounded bg-sky-600 hover:bg-sky-500">Sign up</button>
    </div>
  )
}

function AuthButtons(){
  const auth=useAuth()
  if(!auth?.token){
    return (
      <>
        <Link to="/login" className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-sm">Login</Link>
        <Link to="/register" className="px-3 py-1.5 rounded border border-white/20 text-sm">Register</Link>
      </>
    )
  }
  return (
    <button onClick={auth.logout} className="px-3 py-1.5 rounded border border-white/20 text-sm">Logout</button>
  )
}

function Watchlist(){
  const auth=useAuth()
  const [items,setItems]=React.useState([])
  const [loading,setLoading]=React.useState(true)
  const [status,setStatus]=React.useState('all')
  const [shareUrl,setShareUrl]=React.useState('')
  React.useEffect(()=>{
    if(!auth?.token) return
    (async()=>{
      setLoading(true)
      const {data}=await axios.get(`${API_BASE}/watchlist`,{headers:{Authorization:`Bearer ${auth.token}`}})
      setItems(data.items||[])
      setLoading(false)
    })()
  },[auth?.token])
  if(!auth?.token){return <Navigate to="/login"/>}
  const filtered=items.filter(i=>status==='all'||i.status===status)
  const createShare=async()=>{
    const {data}=await axios.post(`${API_BASE}/share`,{visibility:'unlisted'},{headers:{Authorization:`Bearer ${auth.token}`}})
    const url=`${window.location.origin}/share/${data.link.token}`
    setShareUrl(url)
    try{ await navigator.clipboard.writeText(url) }catch{}
    alert('Share link copied to clipboard')
  }
  const refresh=async()=>{
    const {data}=await axios.get(`${API_BASE}/watchlist`,{headers:{Authorization:`Bearer ${auth.token}`}})
    setItems(data.items||[])
  }
  const updateProgress=async(showId,next,total)=>{
    const status=(total>0 && next>=total)?'completed':(next>0?'watching':'plan')
    await axios.patch(`${API_BASE}/watchlist/${showId}`,{watchedEpisodes:Math.max(0,Math.min(total,next)),status},{headers:{Authorization:`Bearer ${auth.token}`}})
    await refresh()
  }
  const increment=(it)=>updateProgress(it.showId,(it.watchedEpisodes||0)+1,(it.totalEpisodes||0))
  const decrement=(it)=>updateProgress(it.showId,(it.watchedEpisodes||0)-1,(it.totalEpisodes||0))
  const setExact=async(it)=>{
    const total=it.totalEpisodes||0
    const val=Number(prompt(`Enter watched episodes (0-${total})`, String(it.watchedEpisodes||0)))
    if(Number.isFinite(val)) await updateProgress(it.showId,val,total)
  }
  return (
    <div>
      <div className="flex gap-2 mb-4 text-sm">
        {['all','watching','completed','on_hold','dropped','plan'].map(s=> (
          <button key={s} onClick={()=>setStatus(s)} className={`px-3 py-1.5 rounded border ${status===s? 'bg-sky-600 border-sky-500':'border-white/20'}`}>{s.replace('_',' ')}</button>
        ))}
        <div className="ml-auto"/>
        <button onClick={createShare} className="px-3 py-1.5 rounded border border-white/20">Share watchlist</button>
      </div>
      {loading? <p>Loading...</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map(it=> (
            <div key={it.showId} className="bg-slate-800/60 border border-white/10 rounded overflow-hidden">
              <div className="aspect-[3/4] bg-slate-900">{it.poster && <img src={it.poster} alt={it.title} className="w-full h-full object-cover"/>}</div>
              <div className="p-2 text-sm">
                <div className="font-semibold line-clamp-2">{it.title}</div>
                <div className="text-xs text-slate-400 mb-2">{it.year||'—'} • {String(it.type).toUpperCase()}</div>
                <div className="text-xs mb-2">{it.watchedEpisodes}/{it.totalEpisodes} eps · remaining {Math.max(0,(it.totalEpisodes||0)-(it.watchedEpisodes||0))}</div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>decrement(it)} className="px-2 h-7 rounded border border-white/20">-</button>
                  <button onClick={()=>increment(it)} className="px-2 h-7 rounded border border-white/20">+</button>
                  <button onClick={()=>setExact(it)} className="px-2 h-7 rounded border border-white/20">Set</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {shareUrl && <div className="mt-3 text-xs text-slate-400">Share URL: {shareUrl}</div>}
    </div>
  )
}

export default function App(){
  const [token,setToken]=React.useState(()=>localStorage.getItem('token'))
  const login=(t)=>{setToken(t);localStorage.setItem('token',t)}
  const logout=()=>{setToken(null);localStorage.removeItem('token')}
  const authValue={token,login,logout}
  return (
    <AuthContext.Provider value={authValue}>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/browse" />} />
          <Route path="/browse" element={<Browse/>} />
          <Route path="/title/:id" element={<Title/>} />
          <Route path="/watchlist" element={<Watchlist/>} />
          <Route path="/clubs" element={<Clubs/>} />
          <Route path="/share/:token" element={<SharedWatchlist/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
        </Routes>
      </Layout>
    </AuthContext.Provider>
  )
}

function Clubs(){
  const auth=useAuth()
  const [items,setItems]=React.useState([])
  const [loading,setLoading]=React.useState(true)
  const [error,setError]=React.useState('')
  const [q,setQ]=React.useState('')
  const [name,setName]=React.useState('')
  const [description,setDescription]=React.useState('')
  const [isPrivate,setIsPrivate]=React.useState(false)
  const [active,setActive]=React.useState(null)
  const [polls,setPolls]=React.useState([])
  const [question,setQuestion]=React.useState('')
  const [options,setOptions]=React.useState(['',''])
  const fetchClubs=async(query)=>{
    try{
      setLoading(true)
      setError('')
      const {data}=await axios.get(`${API_BASE}/clubs`)
      setItems(data.items||[])
    }catch(e){
      setError('Failed to load clubs')
      setItems([])
    }finally{
      setLoading(false)
    }
  }
  React.useEffect(()=>{fetchClubs('')},[])
  React.useEffect(()=>{
    if(!active) return setPolls([])
    (async()=>{
      try{
        const {data}=await axios.get(`${API_BASE}/polls/club/${active}`)
        setPolls(data.items||[])
      }catch{ setPolls([]) }
    })()
  },[active])
  const createClub=async(e)=>{
    e.preventDefault()
    if(!auth?.token){return alert('Please login to create a club')}
    const {data}=await axios.post(`${API_BASE}/clubs`,{name,description,isPrivate},{headers:{Authorization:`Bearer ${auth.token}`}})
    setName('');setDescription('');setIsPrivate(false)
    setItems([data.club,...items])
  }
  const addOption=()=> setOptions(o=>[...o,''])
  const updateOption=(i,val)=> setOptions(o=>o.map((x,idx)=>idx===i?val:x))
  const createPoll=async(e)=>{
    e.preventDefault()
    if(!auth?.token) return alert('Login to create polls')
    const clean=options.map(s=>s.trim()).filter(Boolean)
    if(!active||!question.trim()||clean.length<2) return alert('Add at least two options')
    const {data}=await axios.post(`${API_BASE}/polls`,{clubId:active,question,options:clean},{headers:{Authorization:`Bearer ${auth.token}`}})
    setPolls([data.poll,...polls])
    setQuestion('');setOptions(['',''])
  }
  const vote=async(pollId,optionIndex)=>{
    if(!auth?.token) return alert('Login to vote')
    await axios.post(`${API_BASE}/polls/${pollId}/vote`,{optionIndex},{headers:{Authorization:`Bearer ${auth.token}`}})
    const {data}=await axios.get(`${API_BASE}/polls/club/${active}`)
    setPolls(data.items||[])
  }
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="flex gap-2 mb-4">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search clubs..." className="flex-1 bg-slate-800 border border-white/10 rounded px-3 h-10"/>
          <button onClick={()=>fetchClubs(q)} className="px-4 rounded bg-sky-600 hover:bg-sky-500">Search</button>
        </div>
        {loading? (
          <p className="text-sm text-slate-400">Loading clubs...</p>
        ) : (
          <>
            {error && <p className="text-sm text-rose-400 mb-2">{error}</p>}
            <div className="grid gap-3">
              {items.length===0 ? (
                <div className="text-sm text-slate-400 border border-white/10 rounded p-3">No clubs yet. Create one on the right.</div>
              ) : (
                items.map(c=> (
                  <button key={c._id} onClick={()=>setActive(c._id)} className={`text-left bg-slate-800/60 border rounded p-3 ${active===c._id?'border-sky-500':'border-white/10'}`}>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-sm text-slate-300">{c.description||'No description.'}</div>
                    <div className="text-xs text-slate-400 mt-1">{c.isPrivate? 'Private':'Public'} • Created {new Date(c.createdAt).toLocaleDateString()}</div>
                  </button>
                ))
              )}
            </div>
          </>
        )}
        {active && (
          <div className="mt-6">
            <div className="font-semibold mb-2">Polls</div>
            <div className="grid gap-3">
              {polls.map(p=> (
                <div key={p._id} className="bg-slate-800/60 border border-white/10 rounded p-3">
                  <div className="font-semibold mb-2">{p.question}</div>
                  <div className="grid gap-2">
                    {p.options.map((opt,idx)=> (
                      <button key={idx} onClick={()=>vote(p._id,idx)} className="text-left bg-slate-900 border border-white/10 rounded px-3 py-2 hover:border-sky-500">
                        <div className="flex items-center justify-between">
                          <span>{opt.text}</span>
                          <span className="text-xs text-slate-400">{opt.votes} votes</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div>
        <form onSubmit={createClub} className="bg-slate-800/60 border border-white/10 rounded p-3">
          <div className="font-semibold mb-2">Create a Club</div>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Club name" required className="w-full mb-2 bg-slate-800 border border-white/10 rounded px-3 h-10"/>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="w-full mb-2 bg-slate-800 border border-white/10 rounded px-3 py-2 h-24"></textarea>
          <label className="text-sm flex items-center gap-2 mb-3"><input type="checkbox" checked={isPrivate} onChange={e=>setIsPrivate(e.target.checked)} /> Private club</label>
          <button type="submit" className="w-full px-4 py-2 rounded bg-sky-600 hover:bg-sky-500">Create</button>
        </form>
        {active && (
          <form onSubmit={createPoll} className="bg-slate-800/60 border border-white/10 rounded p-3 mt-4">
            <div className="font-semibold mb-2">Create Poll</div>
            <input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Question" required className="w-full mb-2 bg-slate-800 border border-white/10 rounded px-3 h-10"/>
            <div className="grid gap-2 mb-2">
              {options.map((v,i)=> (
                <input key={i} value={v} onChange={e=>updateOption(i,e.target.value)} placeholder={`Option ${i+1}`} className="w-full bg-slate-800 border border-white/10 rounded px-3 h-10"/>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={addOption} className="px-3 py-1.5 rounded border border-white/20 text-sm">Add option</button>
              <button type="submit" className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-sm">Create poll</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function SharedWatchlist(){
  const token=window.location.pathname.split('/').pop()
  const [items,setItems]=React.useState([])
  const [loading,setLoading]=React.useState(true)
  React.useEffect(()=>{
    (async()=>{
      try{
        const {data}=await axios.get(`${API_BASE}/share/${token}`)
        setItems(data.items||[])
      }catch{ setItems([]) }
      setLoading(false)
    })()
  },[token])
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Shared Watchlist</h1>
      {loading? <p>Loading...</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map(it=> (
            <div key={it.showId} className="bg-slate-800/60 border border-white/10 rounded overflow-hidden">
              <div className="aspect-[3/4] bg-slate-900">{it.poster && <img src={it.poster} alt={it.title} className="w-full h-full object-cover"/>}</div>
              <div className="p-2 text-sm">
                <div className="font-semibold line-clamp-2">{it.title}</div>
                <div className="text-xs text-slate-400 mb-2">{it.year||'—'} • {String(it.type).toUpperCase()}</div>
                <div className="text-xs">{it.watchedEpisodes}/{it.totalEpisodes} eps</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}



