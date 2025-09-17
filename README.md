# AniTrack (Full-stack demo)

## Prereqs
- Node 18+
- MongoDB running locally (or Atlas URI)

## Setup

Server:

1. cd server
2. npm i
3. Create .env with MONGO_URI, JWT_SECRET, PORT (see below)
4. npm run dev

Client (new terminal):

1. cd client
2. npm i
3. Create client/.env with: VITE_API_BASE=http://localhost:4000/api
4. npm run dev

Open http://localhost:5173

### .env samples
Server .env

PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/anitrack
JWT_SECRET=replace-me

Client .env

VITE_API_BASE=http://localhost:4000/api

## Notes
- Data source: Jikan API (unofficial MyAnimeList) for browse/search.
- Video: public test HLS streams; replace with your CDN or provider.
- Auth: simple JWT; store in memory/localStorage for demo.

## References
- MyAnimeList: https://myanimelist.net/
- Jikan API: https://docs.api.jikan.moe


