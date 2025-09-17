;(function(){
    const qs=(s,el=document)=>el.querySelector(s)
    const qsa=(s,el=document)=>Array.from(el.querySelectorAll(s))

    const STORAGE_KEYS={
        shows:"anitrack.shows",
        progress:"anitrack.progress",
        clubs:"anitrack.clubs",
        theme:"anitrack.theme"
    }

    const AppState={
        shows:[],
        progress:{},
        clubs:[],
        activeStatus:"all",
        filters:{type:"all",genre:"all",year:"all"},
        sort:"relevance",
        search:"",
        theme:"dark"
    }

    function loadState(){
        try{
            const shows=JSON.parse(localStorage.getItem(STORAGE_KEYS.shows)||"null")||Seed.defaultShows
            const progress=JSON.parse(localStorage.getItem(STORAGE_KEYS.progress)||"null")||Seed.defaultProgress
            const clubs=JSON.parse(localStorage.getItem(STORAGE_KEYS.clubs)||"null")||Seed.defaultClubs
            const theme=localStorage.getItem(STORAGE_KEYS.theme)||"dark"
            Object.assign(AppState,{shows,progress,clubs,theme})
        }catch(e){
            Object.assign(AppState,{shows:Seed.defaultShows,progress:Seed.defaultProgress,clubs:Seed.defaultClubs,theme:"dark"})
        }
        applyTheme()
    }

    function saveState(){
        localStorage.setItem(STORAGE_KEYS.shows,JSON.stringify(AppState.shows))
        localStorage.setItem(STORAGE_KEYS.progress,JSON.stringify(AppState.progress))
        localStorage.setItem(STORAGE_KEYS.clubs,JSON.stringify(AppState.clubs))
        localStorage.setItem(STORAGE_KEYS.theme,AppState.theme)
    }

    function applyTheme(){
        if(AppState.theme==="light"){
            document.documentElement.classList.add("theme-light")
        }else{
            document.documentElement.classList.remove("theme-light")
        }
    }

    // UI bindings
    function bindUI(){
        const tabs=qsa('.tab')
        tabs.forEach(t=>t.addEventListener('click',()=>{
            tabs.forEach(x=>x.classList.remove('is-active'))
            t.classList.add('is-active')
            AppState.activeStatus=t.dataset.status
            qs('#sectionTitle').textContent=labelForStatus(AppState.activeStatus)
            render()
        }))

        qs('#filterType').addEventListener('change',e=>{AppState.filters.type=e.target.value;render()})
        qs('#filterGenre').addEventListener('change',e=>{AppState.filters.genre=e.target.value;render()})
        qs('#filterYear').addEventListener('change',e=>{AppState.filters.year=e.target.value;render()})
        qs('#clearFilters').addEventListener('click',()=>{AppState.filters={type:'all',genre:'all',year:'all'};hydrateFilters();render()})

        qs('#sortSelect').addEventListener('change',e=>{AppState.sort=e.target.value;render()})
        qs('#searchInput').addEventListener('input',e=>{AppState.search=e.target.value.trim().toLowerCase();render()})

        qs('#themeToggle').addEventListener('click',()=>{AppState.theme=AppState.theme==='dark'?'light':'dark';applyTheme();saveState()})

        qs('#addShowBtn').addEventListener('click',openAddShow)
        qs('#newClubBtn').addEventListener('click',()=>qs('#clubDialog').showModal())
        qs('#shareBtn').addEventListener('click',shareWatchlist)

        qs('#showForm').addEventListener('submit',saveShowFromForm)
        qs('#clubForm').addEventListener('submit',saveClubFromForm)

        qs('#exportData').addEventListener('click',exportData)
        qs('#importData').addEventListener('click',importData)
    }

    function labelForStatus(status){
        const map={all:'All Shows',watching:'Watching',completed:'Completed',on_hold:'On Hold',dropped:'Dropped',plan:'Plan to Watch'}
        return map[status]||'All Shows'
    }

    function hydrateFilters(){
        const genres=new Set(["All"])
        const years=new Set(["All"])
        AppState.shows.forEach(s=>{
            s.genres.forEach(g=>genres.add(cap(g)))
            if(s.year)years.add(String(s.year))
        })
        fillSelect(qs('#filterGenre'),Array.from(genres),"all")
        fillSelect(qs('#filterYear'),Array.from(years).sort((a,b)=>Number(b)-Number(a)),"all")
        qs('#filterType').value=AppState.filters.type
        qs('#filterGenre').value=AppState.filters.genre
        qs('#filterYear').value=AppState.filters.year
    }

    function fillSelect(sel,values,allValue){
        sel.innerHTML=''
        const mk=(v,l)=>{const o=document.createElement('option');o.value=(v.toLowerCase?v.toLowerCase():v);o.textContent=l||v;return o}
        sel.appendChild(mk('all','All'))
        values.filter(v=>v!=='All').forEach(v=>sel.appendChild(mk(v)))
    }

    function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}

    // Rendering
    function render(){
        saveState()
        renderStats()
        renderClubs()
        renderShows()
    }

    function renderStats(){
        const el=qs('#statsList');
        const total=AppState.shows.length
        const completed=Object.entries(AppState.progress).filter(([id,p])=>p.status==='completed').length
        const watching=Object.entries(AppState.progress).filter(([id,p])=>p.status==='watching').length
        const hours=AppState.shows.reduce((acc,s)=>acc + Math.round(((AppState.progress[s.id]?.watchedEpisodes||0)*24)/60),0)
        el.innerHTML=`
            <li><span>Total shows</span><strong>${total}</strong></li>
            <li><span>Watching</span><strong>${watching}</strong></li>
            <li><span>Completed</span><strong>${completed}</strong></li>
            <li><span>Est. hours watched</span><strong>${hours}</strong></li>
        `
    }

    function renderClubs(){
        const list=qs('#clubList');
        list.innerHTML=''
        AppState.clubs.forEach(c=>{
            const li=document.createElement('li')
            const left=document.createElement('span');left.textContent=c.name
            const right=document.createElement('span');right.textContent=c.isPrivate?'Private':'Public';right.className='badge'
            li.appendChild(left);li.appendChild(right)
            list.appendChild(li)
        })
    }

    function filterSortSearch(shows){
        let list=[...shows]
        if(AppState.activeStatus!=='all'){
            list=list.filter(s=> (AppState.progress[s.id]?.status||'plan')===AppState.activeStatus)
        }
        if(AppState.filters.type!=='all'){
            list=list.filter(s=>s.type===AppState.filters.type)
        }
        if(AppState.filters.genre!=='all'){
            list=list.filter(s=>s.genres.map(g=>g.toLowerCase()).includes(AppState.filters.genre))
        }
        if(AppState.filters.year!=='all'){
            list=list.filter(s=>String(s.year)===AppState.filters.year)
        }
        if(AppState.search){
            const q=AppState.search
            list=list.filter(s=>s.title.toLowerCase().includes(q)||s.synopsis.toLowerCase().includes(q))
        }
        switch(AppState.sort){
            case 'title': list.sort((a,b)=>a.title.localeCompare(b.title)); break
            case 'rating': list.sort((a,b)=>(b.rating||0)-(a.rating||0)); break
            case 'progress': list.sort((a,b)=>((AppState.progress[b.id]?.watchedEpisodes||0)-(AppState.progress[a.id]?.watchedEpisodes||0))); break
            case 'recent': list.sort((a,b)=>0); break
            default: break
        }
        return list
    }

    function renderShows(){
        const grid=qs('#showGrid');
        grid.innerHTML=''
        const list=filterSortSearch(AppState.shows)
        qs('#emptyState').classList.toggle('hidden',list.length>0)
        const tpl=qs('#showCardTemplate')
        list.forEach(show=>{
            const node=tpl.content.cloneNode(true)
            const card=node.querySelector('.card')
            const poster=node.querySelector('.poster');poster.src=show.poster;poster.alt=show.title+" poster"
            node.querySelector('.rating-badge').textContent=(show.rating||"--")
            node.querySelector('.card-title').textContent=show.title
            node.querySelector('.type').textContent=show.type.toUpperCase()
            node.querySelector('.year').textContent=show.year||''
            node.querySelector('.synopsis').textContent=show.synopsis
            const progress=AppState.progress[show.id]||{status:'plan',watchedEpisodes:0}
            const total=show.totalEpisodes||0
            const pct=total?Math.min(100,Math.round((progress.watchedEpisodes/total)*100)):0
            node.querySelector('.progress-fill').style.width=pct+'%'
            node.querySelector('.progress-text').textContent=`${progress.watchedEpisodes}/${total} eps`
            const statusSel=node.querySelector('.statusSelect');statusSel.value=progress.status
            statusSel.addEventListener('change',()=>{updateStatus(show.id,statusSel.value)})
            node.querySelector('[data-action="episodes"]').addEventListener('click',()=>{promptEpisodes(show.id,total)})
            node.querySelector('[data-action="review"]').addEventListener('click',()=>{promptReview(show.id)})
            grid.appendChild(node)
        })
    }

    // Actions
    function updateStatus(showId,status){
        AppState.progress[showId]=Object.assign({watchedEpisodes:0},AppState.progress[showId]||{}, {status})
        render()
    }

    function promptEpisodes(showId,total){
        const current=AppState.progress[showId]?.watchedEpisodes||0
        const next=Number(prompt(`Enter watched episodes (0-${total})`, String(current)))
        if(Number.isFinite(next)){
            AppState.progress[showId]=Object.assign({status:'watching'},AppState.progress[showId]||{}, {watchedEpisodes:Math.max(0,Math.min(total,next))})
            if(AppState.progress[showId].watchedEpisodes===total){AppState.progress[showId].status='completed'}
            render()
        }
    }

    function promptReview(showId){
        const show=AppState.shows.find(s=>s.id===showId)
        const body=prompt(`Write a quick review for ${show.title}`)
        if(body){
            alert('Thanks! (Reviews are stored in a future version)')
        }
    }

    function openAddShow(){
        qs('#modalTitle').textContent='Add Show'
        qs('#showForm').reset()
        qs('#showDialog').showModal()
    }

    function saveShowFromForm(e){
        e.preventDefault()
        const title=qs('#showTitle').value.trim()
        if(!title){return}
        const id=title.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,32)
        const show={
            id,
            title,
            type:qs('#showType').value,
            genres:qs('#showGenres').value.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean),
            year:Number(qs('#showYear').value)||undefined,
            synopsis:qs('#showSynopsis').value.trim(),
            poster:qs('#showPoster').value.trim()||"https://placehold.co/600x800/0b111b/9aa4b2?text=No+Poster",
            totalSeasons:1,
            totalEpisodes:12,
            rating:8
        }
        AppState.shows.unshift(show)
        AppState.progress[show.id]={status:'plan',watchedEpisodes:0}
        qs('#showDialog').close()
        render()
    }

    function saveClubFromForm(e){
        e.preventDefault()
        const name=qs('#clubName').value.trim()
        if(!name)return
        const club={id:'club-'+Date.now(),name,description:qs('#clubDesc').value.trim(),isPrivate:qs('#clubPrivate').checked}
        AppState.clubs.push(club)
        qs('#clubDialog').close()
        render()
    }

    function shareWatchlist(){
        const payload={shows:AppState.shows,progress:AppState.progress}
        const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})
        const url=URL.createObjectURL(blob)
        const a=document.createElement('a');a.href=url;a.download='anitrack-watchlist.json';a.click();URL.revokeObjectURL(url)
    }

    function exportData(e){
        e.preventDefault()
        const payload={shows:AppState.shows,progress:AppState.progress,clubs:AppState.clubs,theme:AppState.theme}
        const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})
        const url=URL.createObjectURL(blob)
        const a=document.createElement('a');a.href=url;a.download='anitrack-data.json';a.click();URL.revokeObjectURL(url)
    }

    function importData(e){
        e.preventDefault()
        const input=document.createElement('input');input.type='file';input.accept='application/json'
        input.onchange=()=>{
            const file=input.files[0];if(!file)return
            const reader=new FileReader();reader.onload=()=>{
                try{
                    const data=JSON.parse(reader.result)
                    if(data.shows)AppState.shows=data.shows
                    if(data.progress)AppState.progress=data.progress
                    if(data.clubs)AppState.clubs=data.clubs
                    if(data.theme)AppState.theme=data.theme
                    applyTheme();render()
                }catch(err){alert('Invalid data file')}
            }
            reader.readAsText(file)
        }
        input.click()
    }

    // Init
    window.addEventListener('DOMContentLoaded',()=>{
        loadState()
        bindUI()
        hydrateFilters()
        render()
    })
})()


