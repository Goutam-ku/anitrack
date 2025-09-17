import React from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Hls from 'hls.js'

const API_BASE=import.meta.env.VITE_API_BASE||'http://localhost:4000/api'

const AuthContext=React.createContext(null)
function useAuth(){ return React.useContext(AuthContext) }

function Layout({children}){
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur bg-slate-900/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="font-bold text-sky-400">AniTrack</Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/browse" className="hover:text-sky-300">Browse</Link>
            <Link to="/watchlist" className="hover:text-sky-300">Watchlist</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <AuthButtons />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">{children}</main>
      <footer className="border-t border-white/10 py-6 text-sm text-slate-400 text-center">Data via Jikan API · Demo only</footer>
    </div>
  )
}

function Browse(){
  const [q,setQ]=React.useState('')
  const [items,setItems]=React.useState([])
  const [loading,setLoading]=React.useState(false)
  const fetchItems=async(query)=>{
    setLoading(true)
    const {data}=await axios.get(`${API_BASE}/shows`,{params:{q:query||'top'}})
    setItems(data.items)
    setLoading(false)
  }
  React.useEffect(()=>{fetchItems('top')},[])
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search anime..." className="flex-1 bg-slate-800 border border-white/10 rounded px-3 h-10"/>
        <button onClick={()=>fetchItems(q)} className="px-4 rounded bg-sky-600 hover:bg-sky-500">Search</button>
      </div>
      {loading? <p>Loading...</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map(it=> <Card key={it.id} item={it}/>) }
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

function Title(){
  const {id}=Object.fromEntries(new URLSearchParams(window.location.pathname.split('/').slice(2).join('&')))
  const animeId=window.location.pathname.split('/').pop()
  const [item,setItem]=React.useState(null)
  const [eps,setEps]=React.useState([])
  React.useEffect(()=>{
    // Reuse browse endpoint for a single id by searching; in real app we'd have detail endpoint
    (async()=>{
      const {data}=await axios.get(`${API_BASE}/shows`,{params:{q:animeId}})
      setItem(data.items?.[0]||null)
      const pl=await axios.get(`${API_BASE}/shows/${animeId}/playlist`)
      setEps(pl.data.items)
    })()
  },[animeId])
  if(!item) return <p>Loading...</p>
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div>
        {item.poster && <img src={item.poster} alt={item.title} className="w-full rounded border border-white/10"/>}
      </div>
      <div className="md:col-span-2">
        <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
        <p className="text-slate-300 mb-4 whitespace-pre-line">{item.synopsis||'No synopsis.'}</p>
        <h2 className="font-semibold mb-2">Episodes</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {eps.map(ep=> <Episode key={ep.id} ep={ep} />)}
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
  return (
    <div>
      <div className="flex gap-2 mb-4 text-sm">
        {['all','watching','completed','on_hold','dropped','plan'].map(s=> (
          <button key={s} onClick={()=>setStatus(s)} className={`px-3 py-1.5 rounded border ${status===s? 'bg-sky-600 border-sky-500':'border-white/20'}`}>{s.replace('_',' ')}</button>
        ))}
      </div>
      {loading? <p>Loading...</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map(it=> (
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
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
        </Routes>
      </Layout>
    </AuthContext.Provider>
  )
}



