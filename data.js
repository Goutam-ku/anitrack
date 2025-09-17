// Seed data and helpers for the Anime & TV Tracker
;(function(){
    const defaultShows=[
        {id:"aot",type:"anime",title:"Shingeki no Kyojin",synopsis:"Humans fight for survival against terrifying Titans behind massive walls.",genres:["action","drama"],year:2013,totalSeasons:4,totalEpisodes:87,poster:"https://image.tmdb.org/t/p/w342/aiy35Evcofzl7hASZZvsFgltHTX.jpg",rating:8.6},
        {id:"fma-b",type:"anime",title:"Fullmetal Alchemist: Brotherhood",synopsis:"Two brothers search for the Philosopher's Stone after a disastrous attempt to revive their mother.",genres:["adventure","fantasy"],year:2009,totalSeasons:1,totalEpisodes:64,poster:"https://image.tmdb.org/t/p/w342/sPvUQ0NQ7vC18m0tHbdDg14Q6g0.jpg",rating:9.1},
        {id:"op",type:"anime",title:"One Piece",synopsis:"Monkey D. Luffy sails to become the Pirate King with his crew.",genres:["adventure","comedy"],year:1999,totalSeasons:20,totalEpisodes:1100,poster:"https://image.tmdb.org/t/p/w342/2KjtRm2F2QZQF4d1vZEBtcHTfb3.jpg",rating:8.7},
        {id:"dn",type:"anime",title:"Death Note",synopsis:"A student discovers a notebook that kills anyone whose name is written in it.",genres:["mystery","thriller"],year:2006,totalSeasons:1,totalEpisodes:37,poster:"https://image.tmdb.org/t/p/w342/9XH4vGKuX3sI5OGucs5cjox96D5.jpg",rating:8.6},
        {id:"saul",type:"tv",title:"Better Call Saul",synopsis:"Jimmy McGill's transformation into the morally challenged lawyer Saul Goodman.",genres:["crime","drama"],year:2015,totalSeasons:6,totalEpisodes:63,poster:"https://image.tmdb.org/t/p/w342/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg",rating:8.8},
        {id:"bb",type:"tv",title:"Breaking Bad",synopsis:"A chemistry teacher turns to making meth with a former student.",genres:["crime","drama"],year:2008,totalSeasons:5,totalEpisodes:62,poster:"https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",rating:9.5}
    ];

    const defaultClubs=[
        {id:"club-1",name:"Shounen Action Fans",description:"Talk big battles and power-ups",isPrivate:false},
        {id:"club-2",name:"Drama & Feels",description:"Tear-jerkers and character studies",isPrivate:false}
    ];

    const defaultProgress={
        // showId -> {status, watchedEpisodes}
        "aot":{status:"watching",watchedEpisodes:40},
        "fma-b":{status:"completed",watchedEpisodes:64},
        "op":{status:"on_hold",watchedEpisodes:120},
        "dn":{status:"plan",watchedEpisodes:0},
        "saul":{status:"watching",watchedEpisodes:18},
        "bb":{status:"completed",watchedEpisodes:62}
    };

    window.Seed={defaultShows,defaultProgress,defaultClubs};
})();


