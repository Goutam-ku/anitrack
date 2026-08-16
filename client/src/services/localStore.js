const STORAGE_KEYS = {
  WATCHLIST: 'anitrack_local_watchlist',
  CLUBS: 'anitrack_local_clubs',
  POLLS: 'anitrack_local_polls'
};

const initialFallbackClubs = [
  {
    _id: "club-1",
    name: "Fantasy & Isekai Guild",
    description: "For enthusiasts of fantasy adventures, world-building, magical power systems, and journey epics.",
    isPrivate: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: "club-2",
    name: "Shonen Hype Society",
    description: "Weekly episode discussions, top battle tier lists, sakuga animation praise, and tournament arcs.",
    isPrivate: false,
    createdAt: new Date().toISOString()
  }
];

const initialFallbackPolls = [
  {
    _id: "poll-1",
    clubId: "club-1",
    question: "Which anime had the best world-building this decade?",
    options: [
      { text: "Frieren: Beyond Journey's End", votes: 48 },
      { text: "Made in Abyss", votes: 31 },
      { text: "Mushoku Tensei", votes: 24 }
    ]
  }
];

export const LocalStore = {
  getWatchlist() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]');
    } catch {
      return [];
    }
  },

  saveWatchlistItem(item) {
    const list = this.getWatchlist();
    const idx = list.findIndex(i => String(i.showId) === String(item.showId));
    const entry = {
      showId: String(item.showId),
      title: item.title || `Show ${item.showId}`,
      poster: item.poster || '',
      status: item.status || 'plan',
      watchedEpisodes: Number(item.watchedEpisodes) || 0,
      totalEpisodes: Number(item.totalEpisodes) || 0,
      type: item.type || 'TV',
      year: item.year || new Date().getFullYear(),
      updatedAt: new Date().toISOString()
    };

    if (idx >= 0) {
      list[idx] = { ...list[idx], ...entry };
    } else {
      list.unshift(entry);
    }
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
    return list;
  },

  updateWatchlistItem(showId, updates) {
    const list = this.getWatchlist();
    const idx = list.findIndex(i => String(i.showId) === String(showId));
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
    }
    return list;
  },

  getClubs(query = '') {
    try {
      const clubs = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLUBS) || JSON.stringify(initialFallbackClubs));
      if (!query || !query.trim()) return clubs;
      const q = query.toLowerCase().trim();
      return clubs.filter(c => c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q)));
    } catch {
      return initialFallbackClubs;
    }
  },

  createClub(club) {
    const clubs = this.getClubs();
    const newClub = {
      _id: `club-${Date.now()}`,
      name: club.name.trim(),
      description: (club.description || '').trim(),
      isPrivate: !!club.isPrivate,
      createdAt: new Date().toISOString()
    };
    clubs.unshift(newClub);
    localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(clubs));
    return newClub;
  },

  getPolls(clubId) {
    try {
      const polls = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLLS) || JSON.stringify(initialFallbackPolls));
      return polls.filter(p => p.clubId === clubId);
    } catch {
      return [];
    }
  },

  createPoll(poll) {
    try {
      const polls = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLLS) || JSON.stringify(initialFallbackPolls));
      const newPoll = {
        _id: `poll-${Date.now()}`,
        clubId: poll.clubId,
        question: poll.question.trim(),
        options: poll.options.map(opt => ({ text: String(opt).trim(), votes: 0 })),
        createdAt: new Date().toISOString()
      };
      polls.unshift(newPoll);
      localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify(polls));
      return newPoll;
    } catch {
      return null;
    }
  },

  votePoll(pollId, optionIndex) {
    try {
      const polls = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLLS) || JSON.stringify(initialFallbackPolls));
      const poll = polls.find(p => p._id === pollId);
      if (poll && poll.options[optionIndex]) {
        poll.options[optionIndex].votes += 1;
        localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify(polls));
      }
      return poll;
    } catch {
      return null;
    }
  }
};
