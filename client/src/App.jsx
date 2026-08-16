import React from 'react'
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import Hls from 'hls.js'
import SkeletonGrid from './components/skeletons/SkeletonGrid'
import SkeletonDetails from './components/skeletons/SkeletonDetails'
import SkeletonWatchlist from './components/skeletons/SkeletonWatchlist'
import SkeletonClubs from './components/skeletons/SkeletonClubs'
import SkeletonStats from './components/skeletons/SkeletonStats'
import BackendStatusModal from './components/BackendStatusModal'
import { ApiClient, getApiBase, getBackendStatus, apiEvents } from './services/apiClient'
import { LocalStore } from './services/localStore'

const AuthContext = React.createContext(null)
function useAuth() { return React.useContext(AuthContext) }

function Layout({ children }) {
  const [theme, setTheme] = React.useState(() => localStorage.getItem('theme') || 'dark')
  const [backendStatus, setBackendStatus] = React.useState(getBackendStatus())
  const [modalOpen, setModalOpen] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const location = useLocation()

  React.useEffect(() => {
    const handleStatus = (e) => setBackendStatus(e.detail.status)
    apiEvents.addEventListener('status-change', handleStatus)
    return () => apiEvents.removeEventListener('status-change', handleStatus)
  }, [])

  React.useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Automatically close mobile menu on route changes
  React.useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/80 dark:bg-slate-900/80 border-b border-black/10 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="font-bold text-sky-400 text-lg flex items-center gap-1.5 shrink-0">
            <span>▶</span> AniTrack
          </Link>

          {/* Desktop Navigation (Hidden on small screens) */}
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link
              to="/browse"
              className={`transition-colors px-2 py-1 rounded ${isActive('/browse') ? 'text-sky-400 font-semibold' : 'hover:text-sky-400 text-slate-600 dark:text-slate-300'}`}
            >
              Browse
            </Link>
            <Link
              to="/watchlist"
              className={`transition-colors px-2 py-1 rounded ${isActive('/watchlist') ? 'text-sky-400 font-semibold' : 'hover:text-sky-400 text-slate-600 dark:text-slate-300'}`}
            >
              Watchlist
            </Link>
            <Link
              to="/clubs"
              className={`transition-colors px-2 py-1 rounded ${isActive('/clubs') ? 'text-sky-400 font-semibold' : 'hover:text-sky-400 text-slate-600 dark:text-slate-300'}`}
            >
              Clubs & Polls
            </Link>
          </nav>

          {/* Desktop Header Actions (Hidden on small screens) */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Status indicator pill */}
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-black/10 dark:border-white/10 text-xs bg-slate-100 dark:bg-slate-800/80 hover:border-sky-500 transition-colors"
              title="Click to check backend status"
            >
              <div className={`status-dot ${backendStatus === 'online' ? 'online' : 'local'}`} />
              <span className="text-[11px] font-medium">
                {backendStatus === 'online' ? 'API Online' : 'Local Mode'}
              </span>
            </button>

            <button
              onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
              className="px-3 py-1.5 rounded border border-black/10 dark:border-white/20 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <AuthButtons />
          </div>

          {/* Mobile Right Controls & Hamburger Button (Visible only on mobile/tablet) */}
          <div className="flex md:hidden items-center gap-2">
            {/* Quick Status Pill on mobile */}
            <button
              onClick={() => setModalOpen(true)}
              className="p-1.5 rounded-full border border-black/10 dark:border-white/10 bg-slate-100 dark:bg-slate-800"
              title="Backend Status"
            >
              <div className={`status-dot ${backendStatus === 'online' ? 'online' : 'local'}`} />
            </button>

            {/* Quick Theme Toggle */}
            <button
              onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
              className="p-1.5 rounded border border-black/10 dark:border-white/20 text-xs hover:bg-black/5 dark:hover:bg-white/5"
              title="Toggle Theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="p-2 rounded-lg border border-black/10 dark:border-white/20 text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                // Close 'X' Icon
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger 3-line Icon
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-black/10 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-4 animate-fadeInDown shadow-2xl space-y-4">
            <nav className="flex flex-col space-y-1">
              <Link
                to="/browse"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/browse')
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>🔍</span>
                <span>Browse & Search</span>
              </Link>
              <Link
                to="/watchlist"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/watchlist')
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>📑</span>
                <span>My Watchlist</span>
              </Link>
              <Link
                to="/clubs"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/clubs')
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>👥</span>
                <span>Clubs & Polls</span>
              </Link>
            </nav>

            <div className="pt-2 border-t border-black/10 dark:border-white/10 flex flex-col gap-2">
              <button
                onClick={() => { setModalOpen(true); setMobileMenuOpen(false); }}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-black/5 dark:border-white/5 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <span className="flex items-center gap-2">
                  <div className={`status-dot ${backendStatus === 'online' ? 'online' : 'local'}`} />
                  <span>Backend Status</span>
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {backendStatus === 'online' ? 'API Online' : 'Local Mode'} &rarr;
                </span>
              </button>

              <div className="pt-1">
                <AuthButtons onAction={() => setMobileMenuOpen(false)} isMobile />
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">{children}</main>
      <footer className="border-t border-black/10 dark:border-white/10 py-6 text-sm text-slate-500 dark:text-slate-400 text-center">
        AniTrack · Discover, Track & Stream Anime with Intelligent Resiliency
      </footer>
      <BackendStatusModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

function Browse() {
  const [q, setQ] = React.useState('')
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [filters, setFilters] = React.useState({ type: 'all', genre: 'all', year: 'all' })
  const [open, setOpen] = React.useState(false)
  const auth = useAuth()
  const [summary, setSummary] = React.useState({ watching: 0, completed: 0, hours: 0 })

  const fetchItems = async (query) => {
    setLoading(true)
    setError('')
    try {
      const data = await ApiClient.fetchAnimeList(query)
      setItems(data || [])
    } catch {
      setItems([])
      setError('Unable to load shows. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { fetchItems('top') }, [])

  React.useEffect(() => {
    (async () => {
      try {
        let list = []
        if (auth?.token) {
          try {
            const { data } = await axios.get(`${getApiBase()}/watchlist`, {
              headers: { Authorization: `Bearer ${auth.token}` },
              timeout: 3000
            })
            list = data.items || []
          } catch {
            list = LocalStore.getWatchlist()
          }
        } else {
          list = LocalStore.getWatchlist()
        }
        const watching = list.filter(i => i.status === 'watching').length
        const completed = list.filter(i => i.status === 'completed').length
        const hours = list.reduce((acc, i) => acc + ((i.watchedEpisodes || 0) * 24 / 60), 0)
        setSummary({ watching, completed, hours: Math.round(hours) })
      } catch {
        setSummary({ watching: 0, completed: 0, hours: 0 })
      }
    })()
  }, [auth?.token])

  const years = React.useMemo(() => {
    const y = new Set(['All'])
    items.forEach(i => { if (i.year) y.add(String(i.year)) })
    return Array.from(y).sort((a, b) => Number(b) - Number(a))
  }, [items])

  const filtered = React.useMemo(() => {
    return items.filter(i => {
      if (filters.type !== 'all' && String(i.type || '').toLowerCase() !== filters.type) return false
      if (filters.year !== 'all' && String(i.year) !== filters.year) return false
      return true
    })
  }, [items, filters])

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') fetchItems(q) }}
          placeholder="Search anime titles, genres..."
          className="flex-1 bg-slate-100 dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded px-3 h-10 text-sm focus:outline-none focus:border-sky-500"
        />
        <button onClick={() => fetchItems(q)} className="px-4 h-10 rounded bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors">
          Search
        </button>
        <div className="ml-auto relative">
          <button onClick={() => setOpen(o => !o)} className="px-3 h-10 rounded border border-black/10 dark:border-white/20 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5">
            Filters
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900/95 backdrop-blur border border-black/10 dark:border-white/10 rounded-lg p-3 shadow-2xl z-20 space-y-3">
              <div className="text-sm font-semibold">Filter results</div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-500 dark:text-slate-400">
                  Type
                  <select
                    value={filters.type}
                    onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
                    className="mt-1 w-full bg-slate-100 dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded px-2 h-9 text-xs"
                  >
                    <option value="all">All</option>
                    <option value="tv">TV</option>
                    <option value="movie">Movie</option>
                    <option value="ova">OVA</option>
                    <option value="ona">ONA</option>
                    <option value="special">Special</option>
                  </select>
                </label>
                <label className="text-xs text-slate-500 dark:text-slate-400">
                  Year
                  <select
                    value={filters.year}
                    onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}
                    className="mt-1 w-full bg-slate-100 dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded px-2 h-9 text-xs"
                  >
                    {years.map(y => <option key={y} value={typeof y === 'string' ? y.toLowerCase() : y}>{y}</option>)}
                  </select>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setFilters({ type: 'all', genre: 'all', year: 'all' })} className="px-3 h-8 rounded border border-white/20 text-xs">
                  Clear
                </button>
                <button onClick={() => setOpen(false)} className="px-3 h-8 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold">
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary Bar */}
      <SummaryBar total={filtered.length} watching={summary.watching} completed={summary.completed} hours={summary.hours} />

      {/* Main Content with Skeleton Loading */}
      {loading ? (
        <SkeletonGrid count={12} />
      ) : error ? (
        <div className="text-center p-8 bg-slate-800/40 border border-white/10 rounded-lg">
          <p className="text-rose-400 mb-3">{error}</p>
          <button onClick={() => fetchItems('top')} className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold">
            Retry Loading
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-12 bg-slate-800/40 border border-white/10 rounded-lg text-slate-400">
          No anime found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map(item => <AnimeCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  )
}

function AnimeCard({ item }) {
  return (
    <Link to={`/title/${item.id}`} className="bg-slate-100 dark:bg-slate-800/60 border border-black/10 dark:border-white/10 rounded-lg overflow-hidden hover:border-sky-500/50 hover:shadow-lg transition-all group flex flex-col">
      <div className="aspect-[3/4] bg-slate-200 dark:bg-slate-900 relative overflow-hidden">
        {item.poster ? (
          <img src={item.poster} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Image</div>
        )}
        {item.rating && (
          <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur px-1.5 py-0.5 rounded text-[11px] font-bold text-amber-400 border border-white/10">
            ★ {Number(item.rating).toFixed(1)}
          </div>
        )}
      </div>
      <div className="p-2.5 flex-1 flex flex-col justify-between">
        <div className="text-sm font-semibold line-clamp-2 leading-tight mb-1 text-slate-900 dark:text-slate-100">{item.title}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span>{item.year || '—'}</span>
          <span>•</span>
          <span className="uppercase font-medium">{String(item.type || 'TV')}</span>
        </div>
      </div>
    </Link>
  )
}

function SummaryBar({ total, watching, completed, hours }) {
  return (
    <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
      <SummaryItem label="Catalog shows" value={total} />
      <SummaryItem label="Watching" value={watching} highlight="text-sky-400" />
      <SummaryItem label="Completed" value={completed} highlight="text-emerald-400" />
      <SummaryItem label="Est. hours" value={`${hours}h`} />
    </div>
  )
}

function SummaryItem({ label, value, highlight }) {
  return (
    <div className="bg-slate-100 dark:bg-slate-800/60 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`text-lg font-bold ${highlight || 'text-slate-900 dark:text-slate-100'}`}>{value}</div>
    </div>
  )
}

function TitleDetails() {
  const id = window.location.pathname.split('/').pop()
  const [show, setShow] = React.useState(null)
  const [playlist, setPlaylist] = React.useState([])
  const [currentEp, setCurrentEp] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [feedback, setFeedback] = React.useState('')
  const auth = useAuth()

  React.useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const [showData, playlistData] = await Promise.all([
          ApiClient.fetchShowDetails(id),
          ApiClient.fetchPlaylist(id)
        ])
        setShow(showData)
        setPlaylist(playlistData)
        if (playlistData?.length > 0) {
          setCurrentEp(playlistData[0])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const addToWatchlist = async () => {
    if (!show) return
    const entry = {
      showId: String(id),
      title: show.title,
      poster: show.poster,
      status: 'plan',
      watchedEpisodes: 0,
      totalEpisodes: show.episodes || 0,
      type: show.type,
      year: show.year
    }

    if (auth?.token) {
      try {
        await axios.post(`${getApiBase()}/watchlist`, entry, {
          headers: { Authorization: `Bearer ${auth.token}` },
          timeout: 3000
        })
      } catch {
        LocalStore.saveWatchlistItem(entry)
      }
    } else {
      LocalStore.saveWatchlistItem(entry)
    }

    setFeedback('Added to watchlist!')
    setTimeout(() => setFeedback(''), 3000)
    window.dispatchEvent(new CustomEvent('watchlist:changed'))
  }

  const addOneWatched = async () => {
    if (!show) return
    const list = LocalStore.getWatchlist()
    const found = list.find(i => String(i.showId) === String(id))
    const current = (found?.watchedEpisodes || 0) + 1
    const total = show.episodes || 0
    const status = total > 0 && current >= total ? 'completed' : 'watching'

    const updated = {
      showId: String(id),
      title: show.title,
      poster: show.poster,
      status,
      watchedEpisodes: total > 0 && current > total ? total : current,
      totalEpisodes: total,
      type: show.type,
      year: show.year
    }

    if (auth?.token) {
      try {
        await axios.post(`${getApiBase()}/watchlist`, updated, {
          headers: { Authorization: `Bearer ${auth.token}` },
          timeout: 3000
        })
      } catch {
        LocalStore.saveWatchlistItem(updated)
      }
    } else {
      LocalStore.saveWatchlistItem(updated)
    }

    setFeedback(`Marked episode ${current} as watched!`)
    setTimeout(() => setFeedback(''), 3000)
    window.dispatchEvent(new CustomEvent('watchlist:changed'))
  }

  if (loading) {
    return <SkeletonDetails />
  }

  if (!show) {
    return <div className="text-center p-8">Anime title not found.</div>
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div>
        {show.poster && (
          <img src={show.poster} alt={show.title} className="w-full rounded-lg border border-black/10 dark:border-white/10 shadow-xl" />
        )}
      </div>
      <div className="md:col-span-2">
        <h1 className="text-2xl font-bold mb-2">{show.title}</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-4 whitespace-pre-line text-sm leading-relaxed">{show.synopsis || 'No synopsis.'}</p>
        <div className="flex items-center gap-2 mb-4">
          <button onClick={addToWatchlist} className="px-3.5 py-1.5 rounded border border-black/10 dark:border-white/20 text-sm font-semibold hover:bg-white/5 transition-colors">
            Add to Watchlist
          </button>
          <button onClick={addOneWatched} className="px-3.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors">
            +1 Watched
          </button>
          {feedback && <span className="text-xs text-emerald-400 font-medium ml-2">{feedback}</span>}
        </div>

        {currentEp && <Player ep={currentEp} />}

        <h2 className="font-semibold mt-6 mb-3 text-base">Episode Playlist</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {playlist.map(ep => (
            <button
              key={ep.id}
              onClick={() => setCurrentEp(ep)}
              className={`text-left bg-slate-100 dark:bg-slate-800/60 border rounded-lg p-3 transition-colors ${currentEp?.id === ep.id ? 'border-sky-500 bg-sky-500/10' : 'border-black/10 dark:border-white/10 hover:border-sky-500/50'}`}
            >
              <div className="font-semibold text-sm mb-1">{ep.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{currentEp?.id === ep.id ? '▶ Now Playing' : 'Click to play'}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Player({ ep }) {
  const ref = React.useRef(null)
  React.useEffect(() => {
    const video = ref.current
    if (!video || !ep?.hls) return
    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(ep.hls)
      hls.attachMedia(video)
      video.play().catch(() => {})
      return () => hls.destroy()
    } else {
      video.src = ep.hls
      video.play().catch(() => {})
    }
  }, [ep?.hls])

  return (
    <div className="bg-slate-100 dark:bg-slate-800/60 border border-black/10 dark:border-white/10 rounded-lg p-3">
      <div className="font-semibold text-sm mb-2">{ep.title}</div>
      <video ref={ref} controls autoPlay className="w-full aspect-video rounded bg-black" />
    </div>
  )
}

function Watchlist() {
  const auth = useAuth()
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState('all')
  const [shareUrl, setShareUrl] = React.useState('')
  const [shareMsg, setShareMsg] = React.useState('')

  const loadWatchlist = async () => {
    setLoading(true)
    try {
      if (auth?.token) {
        try {
          const { data } = await axios.get(`${getApiBase()}/watchlist`, {
            headers: { Authorization: `Bearer ${auth.token}` },
            timeout: 3500
          })
          setItems(data.items || [])
          setLoading(false)
          return
        } catch {}
      }
      setItems(LocalStore.getWatchlist())
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { loadWatchlist() }, [auth?.token])

  const filtered = items.filter(i => (filter === 'all' ? true : i.status === filter))

  const handleShare = async () => {
    try {
      let token = `share-${Date.now().toString(36)}`
      if (auth?.token) {
        try {
          const { data } = await axios.post(`${getApiBase()}/share`, { visibility: 'unlisted' }, {
            headers: { Authorization: `Bearer ${auth.token}` },
            timeout: 3000
          })
          if (data.link?.token) token = data.link.token
        } catch {}
      }
      const url = `${window.location.origin}/share/${token}`
      setShareUrl(url)
      try {
        await navigator.clipboard.writeText(url)
        setShareMsg('Share link copied to clipboard!')
      } catch {
        setShareMsg('Share link generated!')
      }
      setTimeout(() => setShareMsg(''), 4000)
    } catch {}
  }

  const updateProgress = async (showId, count, total) => {
    const validCount = Math.max(0, count)
    const status = total > 0 && validCount >= total ? 'completed' : validCount > 0 ? 'watching' : 'plan'

    if (auth?.token) {
      try {
        await axios.patch(`${getApiBase()}/watchlist/${showId}`, {
          watchedEpisodes: validCount,
          status
        }, {
          headers: { Authorization: `Bearer ${auth.token}` },
          timeout: 3000
        })
      } catch {}
    }
    const updated = LocalStore.updateWatchlistItem(showId, { watchedEpisodes: validCount, status })
    setItems([...updated])
  }

  const handleSetEpisodes = (item) => {
    const total = item.totalEpisodes || 0
    const current = item.watchedEpisodes || 0
    const val = prompt(`Enter watched episodes for "${item.title}" (Total: ${total || 'Unknown'}):`, String(current))
    if (val !== null) {
      const num = parseInt(val, 10)
      if (!isNaN(num)) updateProgress(item.showId, num, total)
    }
  }

  if (loading) {
    return <SkeletonWatchlist />
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-sm flex-wrap">
        {['all', 'watching', 'completed', 'on_hold', 'dropped', 'plan'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold capitalize transition-colors ${filter === s ? 'bg-sky-600 border-sky-500 text-white' : 'border-black/10 dark:border-white/20'}`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
        <div className="ml-auto" />
        <button onClick={handleShare} className="px-3 py-1.5 rounded border border-black/10 dark:border-white/20 text-xs font-semibold hover:bg-white/5">
          Share Watchlist
        </button>
      </div>

      {shareMsg && (
        <div className="mb-3 text-xs p-2 rounded bg-sky-500/10 text-sky-400 font-medium">
          {shareMsg}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center p-12 bg-slate-800/40 border border-white/10 rounded-lg text-slate-400">
          No anime in this section. <Link to="/browse" className="text-sky-400 underline ml-1">Browse shows</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map(i => {
            const watched = i.watchedEpisodes || 0
            const total = i.totalEpisodes || 0
            return (
              <div key={i.showId} className="bg-slate-100 dark:bg-slate-800/60 border border-black/10 dark:border-white/10 rounded-lg overflow-hidden flex flex-col justify-between">
                <Link to={`/title/${i.showId}`} className="aspect-[3/4] bg-slate-200 dark:bg-slate-900 block overflow-hidden">
                  {i.poster && <img src={i.poster} alt={i.title} className="w-full h-full object-cover" />}
                </Link>
                <div className="p-2.5 text-sm">
                  <div className="font-semibold line-clamp-2 mb-1">{i.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {i.year || '—'} • {String(i.type || 'TV').toUpperCase()}
                  </div>
                  <div className="text-xs mb-3 font-medium">
                    {watched}/{total || '?'} eps · remaining {Math.max(0, (total || 0) - watched)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateProgress(i.showId, watched - 1, total)} className="px-2 h-7 rounded border border-white/20 text-xs font-bold hover:bg-white/5">
                      -
                    </button>
                    <button onClick={() => updateProgress(i.showId, watched + 1, total)} className="px-2 h-7 rounded border border-white/20 text-xs font-bold hover:bg-white/5">
                      +
                    </button>
                    <button onClick={() => handleSetEpisodes(i)} className="px-2.5 h-7 rounded border border-white/20 text-xs font-medium hover:bg-white/5">
                      Set
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {shareUrl && (
        <div className="mt-4 text-xs text-slate-400 p-2 bg-slate-800/40 rounded border border-white/10">
          Share Link: <a href={shareUrl} target="_blank" rel="noreferrer" className="text-sky-400 underline">{shareUrl}</a>
        </div>
      )}
    </div>
  )
}

function Clubs() {
  const auth = useAuth()
  const [clubs, setClubs] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [q, setQ] = React.useState('')
  const [name, setName] = React.useState('')
  const [desc, setDesc] = React.useState('')
  const [isPrivate, setIsPrivate] = React.useState(false)
  const [activeClub, setActiveClub] = React.useState(null)
  const [polls, setPolls] = React.useState([])
  const [pollQ, setPollQ] = React.useState('')
  const [options, setOptions] = React.useState(['', ''])

  const loadClubs = async (query = '') => {
    setLoading(true)
    try {
      if (auth?.token) {
        try {
          const { data } = await axios.get(`${getApiBase()}/clubs`, { params: { q: query }, timeout: 3500 })
          setClubs(data.items || [])
          if (data.items?.length > 0 && !activeClub) setActiveClub(data.items[0]._id)
          setLoading(false)
          return
        } catch {}
      }
      const local = LocalStore.getClubs(query)
      setClubs(local)
      if (local?.length > 0 && !activeClub) setActiveClub(local[0]._id)
    } catch {
      setClubs([])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { loadClubs('') }, [])

  React.useEffect(() => {
    if (!activeClub) return
    const clubPolls = LocalStore.getPolls(activeClub)
    setPolls(clubPolls)
  }, [activeClub])

  const createClub = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const club = LocalStore.createClub({ name, description: desc, isPrivate })
    setClubs(prev => [club, ...prev])
    setActiveClub(club._id)
    setName('')
    setDesc('')
    setIsPrivate(false)
  }

  const createPoll = async (e) => {
    e.preventDefault()
    const valid = options.map(o => o.trim()).filter(Boolean)
    if (!activeClub || !pollQ.trim() || valid.length < 2) return
    const poll = LocalStore.createPoll({ clubId: activeClub, question: pollQ, options: valid })
    if (poll) setPolls(prev => [poll, ...prev])
    setPollQ('')
    setOptions(['', ''])
  }

  const votePoll = (pollId, idx) => {
    const updated = LocalStore.votePoll(pollId, idx)
    if (updated) setPolls(prev => prev.map(p => (p._id === pollId ? updated : p)))
  }

  if (loading) {
    return <SkeletonClubs />
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="flex gap-2">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search clubs..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded px-3 h-10 text-sm"
          />
          <button onClick={() => loadClubs(q)} className="px-4 rounded bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold">
            Search
          </button>
        </div>

        <div className="grid gap-3">
          {clubs.map(c => (
            <button
              key={c._id}
              onClick={() => setActiveClub(c._id)}
              className={`text-left bg-slate-100 dark:bg-slate-800/60 border rounded-lg p-3 transition-colors ${activeClub === c._id ? 'border-sky-500 bg-sky-500/10' : 'border-black/10 dark:border-white/10 hover:border-sky-500/50'}`}
            >
              <div className="font-semibold text-sm mb-1">{c.name}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">{c.description || 'No description.'}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {c.isPrivate ? 'Private' : 'Public'} • Active discussions
              </div>
            </button>
          ))}
        </div>

        {activeClub && (
          <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
            <div className="font-semibold text-base">Community Polls</div>
            <div className="grid gap-3">
              {polls.map(p => {
                const total = p.options.reduce((acc, o) => acc + (o.votes || 0), 0)
                return (
                  <div key={p._id} className="bg-slate-100 dark:bg-slate-800/60 border border-black/10 dark:border-white/10 rounded-lg p-3.5 space-y-2">
                    <div className="font-semibold text-sm">{p.question}</div>
                    <div className="grid gap-2">
                      {p.options.map((opt, idx) => {
                        const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0
                        return (
                          <button
                            key={idx}
                            onClick={() => votePoll(p._id, idx)}
                            className="relative overflow-hidden text-left bg-slate-200 dark:bg-slate-900 border border-white/10 rounded px-3 py-2 hover:border-sky-500 transition-colors"
                          >
                            <div className="absolute inset-y-0 left-0 bg-sky-500/20" style={{ width: `${pct}%` }} />
                            <div className="relative flex items-center justify-between text-xs font-medium">
                              <span>{opt.text}</span>
                              <span className="text-slate-400">{opt.votes} votes ({pct}%)</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <form onSubmit={createClub} className="bg-slate-100 dark:bg-slate-800/60 border border-black/10 dark:border-white/10 rounded-lg p-4 space-y-2.5">
          <div className="font-semibold text-sm">Create a Club</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Club name"
            required
            className="w-full bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded px-3 h-9 text-sm"
          />
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Description..."
            rows={3}
            className="w-full bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded px-3 py-2 text-sm"
          />
          <label className="text-xs flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
            <span>Private Club</span>
          </label>
          <button type="submit" className="w-full py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors">
            Create Club
          </button>
        </form>

        {activeClub && (
          <form onSubmit={createPoll} className="bg-slate-100 dark:bg-slate-800/60 border border-black/10 dark:border-white/10 rounded-lg p-4 space-y-2.5">
            <div className="font-semibold text-sm">Create Poll</div>
            <input
              value={pollQ}
              onChange={e => setPollQ(e.target.value)}
              placeholder="Question"
              required
              className="w-full bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded px-3 h-9 text-sm"
            />
            {options.map((opt, idx) => (
              <input
                key={idx}
                value={opt}
                onChange={e => setOptions(opts => opts.map((v, i) => (i === idx ? e.target.value : v)))}
                placeholder={`Option ${idx + 1}`}
                className="w-full bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded px-3 h-8 text-xs"
              />
            ))}
            <div className="flex gap-2">
              <button type="button" onClick={() => setOptions(o => [...o, ''])} className="px-2.5 py-1.5 rounded border border-white/20 text-xs font-semibold hover:bg-white/5">
                + Option
              </button>
              <button type="submit" className="flex-1 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold">
                Create Poll
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function Shared() {
  const token = window.location.pathname.split('/').pop()
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const { data } = await axios.get(`${getApiBase()}/share/${token}`, { timeout: 3500 })
        setItems(data.items || [])
      } catch {
        setItems(LocalStore.getWatchlist())
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  if (loading) {
    return <SkeletonWatchlist />
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Shared Watchlist</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map(i => (
          <div key={i.showId} className="bg-slate-100 dark:bg-slate-800/60 border border-black/10 dark:border-white/10 rounded-lg overflow-hidden">
            <div className="aspect-[3/4] bg-slate-200 dark:bg-slate-900">
              {i.poster && <img src={i.poster} alt={i.title} className="w-full h-full object-cover" />}
            </div>
            <div className="p-2.5 text-sm">
              <div className="font-semibold line-clamp-2 mb-1">{i.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                {i.year || '—'} • {String(i.type || 'TV').toUpperCase()}
              </div>
              <div className="text-xs font-medium">{i.watchedEpisodes}/{i.totalEpisodes} eps</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Login() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [err, setErr] = React.useState('')

  const handleLogin = async (e) => {
    e?.preventDefault?.()
    try {
      const { data } = await axios.post(`${getApiBase()}/auth/login`, { email, password }, { timeout: 3500 })
      auth.login(data.token)
      navigate('/')
    } catch {
      // Demo fallback login
      auth.login(`local-token-${Date.now()}`)
      navigate('/')
    }
  }

  const handleDemo = () => {
    auth.login(`demo-token-${Date.now()}`)
    navigate('/')
  }

  return (
    <div className="max-w-sm mx-auto p-6 bg-slate-100 dark:bg-slate-800/60 border border-black/10 dark:border-white/10 rounded-xl space-y-4">
      <h1 className="text-xl font-bold">Login</h1>
      {err && <div className="text-xs text-rose-400">{err}</div>}
      <form onSubmit={handleLogin} className="space-y-3">
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
          className="w-full bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded px-3 h-10 text-sm"
        />
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          required
          className="w-full bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded px-3 h-10 text-sm"
        />
        <button type="submit" className="w-full py-2.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors">
          Sign In
        </button>
      </form>
      <button onClick={handleDemo} type="button" className="w-full py-2 rounded border border-white/20 text-xs font-semibold hover:bg-white/5">
        ⚡ Demo Login (OtakuMaster)
      </button>
    </div>
  )
}

function Register() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [email, setEmail] = React.useState('')
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [err, setErr] = React.useState('')

  const handleReg = async (e) => {
    e?.preventDefault?.()
    try {
      const { data } = await axios.post(`${getApiBase()}/auth/register`, { email, username, password }, { timeout: 3500 })
      auth.login(data.token)
      navigate('/')
    } catch {
      auth.login(`local-token-${Date.now()}`)
      navigate('/')
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 bg-slate-100 dark:bg-slate-800/60 border border-black/10 dark:border-white/10 rounded-xl space-y-4">
      <h1 className="text-xl font-bold">Create Account</h1>
      {err && <div className="text-xs text-rose-400">{err}</div>}
      <form onSubmit={handleReg} className="space-y-3">
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
          className="w-full bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded px-3 h-10 text-sm"
        />
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          required
          className="w-full bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded px-3 h-10 text-sm"
        />
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          required
          className="w-full bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded px-3 h-10 text-sm"
        />
        <button type="submit" className="w-full py-2.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors">
          Sign Up
        </button>
      </form>
    </div>
  )
}

function AuthButtons({ onAction, isMobile }) {
  const auth = useAuth()
  if (auth?.token) {
    return (
      <div className={isMobile ? 'flex flex-col gap-2' : 'flex items-center gap-2'}>
        <button
          onClick={() => { auth.logout(); onAction?.(); }}
          className={`rounded border border-black/10 dark:border-white/20 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${isMobile ? 'w-full py-2.5 text-center' : 'px-3 py-1.5'}`}
        >
          Logout
        </button>
      </div>
    )
  }
  return (
    <div className={isMobile ? 'grid grid-cols-2 gap-2' : 'flex items-center gap-2'}>
      <Link
        to="/login"
        onClick={() => onAction?.()}
        className={`rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold text-center transition-colors ${isMobile ? 'py-2.5' : 'px-3 py-1.5'}`}
      >
        Login
      </Link>
      <Link
        to="/register"
        onClick={() => onAction?.()}
        className={`rounded border border-black/10 dark:border-white/20 text-xs font-semibold text-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${isMobile ? 'py-2.5' : 'px-3 py-1.5'}`}
      >
        Register
      </Link>
    </div>
  )
}

export default function App() {
  const [token, setToken] = React.useState(() => localStorage.getItem('token'))
  const authValue = React.useMemo(() => ({
    token,
    login: (t) => { setToken(t); localStorage.setItem('token', t) },
    logout: () => { setToken(null); localStorage.removeItem('token') }
  }), [token])

  return (
    <AuthContext.Provider value={authValue}>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/browse" replace />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/title/:id" element={<TitleDetails />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/share/:token" element={<Shared />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Layout>
    </AuthContext.Provider>
  )
}
