# Photo Frame

A full-stack photo management and digital photo frame application. Upload, organize, and display your photos in a continuous slideshow — with AI-powered album creation using natural language search.

## Main Features

- **Digital Photo Frame** — Full-screen slideshow with configurable intervals, transition effects, and session persistence. Supports playing all photos or curated playlists from specific albums.
- **Photo Library** — Browse, select, upload, and delete photos with paginated grid views and responsive thumbnails.
- **Album Management** — Create, rename, reorder, and delete albums. Drag-and-drop photo ordering within albums.
- **AI-Powered Album Creation** — Describe what you want in natural language (e.g. *"sunset photos from last summer"*) and the app creates an album using a combination of metadata filters and semantic image search.
- **Semantic Search** — Photos are automatically embedded into a vector database on upload, enabling visual similarity search (e.g. *"dogs"*, *"people at a party"*).
- **Dark / Light Theme** — System-wide theme toggle with CSS variables.
- **Responsive Design** — Mobile-first layouts using CSS Grid with responsive breakpoints.

---

## Feature Details

### Photo Upload
Photos are uploaded via presigned S3 URLs. The client extracts EXIF metadata (date, GPS coordinates, orientation) before upload. After a successful upload, an SQS message triggers the embedding worker to generate a vector embedding of the image for semantic search.

### Slideshow (Frame)
The slideshow engine pre-fetches a queue of 5 photos and cycles through them at a configurable interval (seconds, minutes, or hours). It supports:
- **All Photos** — Shuffles through the entire library.
- **Album Playlist** — Plays through selected albums in order, automatically advancing to the next album.
- **Session Persistence** — Slideshow sessions are stored in the database and persist across page reloads or interruptions. When resumed, the slideshow picks up from the same photo where it left off.

### Albums
- Photos can be added to albums from the library or uploaded directly into an album.
- Drag-and-drop reordering within albums.
- Each album displays a cover photo (first photo in the album).
- Albums support renaming and deletion.

### AI / LLM Search
A natural language query is processed through a pipeline:
1. **OpenAI (gpt-4o-mini)** parses the query into structured filters: date ranges, year, month, day of week, orientation, location, and a semantic search flag.
2. **Geocoding (Nominatim)** converts location names into bounding boxes for spatial SQL queries.
3. **MySQL** filters photos by metadata (dates, GPS coordinates, orientation).
4. **Pinecone** performs vector similarity search using an LLM-extracted semantic query, intersected with the SQL results.
5. The matched photos are assembled into a new album with a generated name and description.

### Settings
- Slideshow interval (value + unit)
- Transition type
- Theme toggle (light / dark)

---

## Architecture

### System Overview

The application is composed of three services:

| Service | Stack | Port |
|---------|-------|------|
| **Client** | React, SCSS, React Router | 3000 |
| **Server** | Express, Knex, Objection.js | 3001 |
| **Embedding Worker** | Python, FastAPI, PyTorch, CLIP | 8000 |

### Infrastructure

| Component | Purpose |
|-----------|---------|
| **MySQL** | Relational data: users, photos, albums, sessions |
| **AWS S3** | Photo storage (originals + thumbnails) via presigned URLs |
| **AWS SQS** | Message queue for async embedding jobs |
| **Pinecone** | Vector database for image embeddings (512-dim CLIP vectors) |
| **OpenAI API** | Natural language → structured filter parsing |
| **Nominatim** | Geocoding (location name → bounding box) |

### Data Flow

```
Client ←→ Express API ←→ MySQL
                ↕              
           S3 (presigned URLs)  
                ↕
Client → S3 (direct upload)
                ↕
         API → SQS → Embedding Worker → S3 (download)
                                       → CLIP (embed)
                                       → Pinecone (store)
```

### Project Structure

```
├── client/                     # React frontend
│   └── src/
│       ├── components/
│       │   ├── AllPhotos/       # Photo library grid
│       │   ├── Albums2/         # Album list, album detail, album items
│       │   ├── Frame/           # Slideshow engine
│       │   ├── StartSlideShow/  # Session setup
│       │   ├── Settings/        # App configuration
│       │   ├── Popups/          # Modal system (upload, confirm, add-to-album, etc.)
│       │   ├── Nav/             # Top navigation
│       │   ├── BottomNav/       # Mobile bottom navigation
│       │   ├── Header/          # App header
│       │   ├── Login/           # Authentication
│       │   └── ThumbnailSelect/ # Reusable selectable thumbnail
│       ├── Contexts/            # React contexts (Auth, Popup, Theme)
│       ├── services/            # API client (photoService)
│       └── utils/               # Constants, helpers
│
├── server/                      # Express backend
│   ├── controllers/
│   │   ├── photoController.js   # Upload, delete, sessions, thumbnails
│   │   ├── albumController.js   # CRUD albums, reorder, add/remove photos
│   │   ├── llmController.js     # AI search + album creation
│   │   └── userController.js    # Auth (register, login, logout)
│   ├── models/                  # Objection.js models (User, Photo, Album, Session)
│   ├── services/
│   │   ├── llmService.js        # OpenAI Responses API wrapper
│   │   ├── embeddingService.js  # Text embedding via worker API
│   │   ├── pineconeService.js   # Pinecone client
│   │   ├── geoService.js        # Nominatim geocoding
│   │   └── sqsService.js        # SQS message handling
│   ├── prompts/                 # LLM system prompts + JSON schema
│   ├── routes/                  # Express route definitions
│   └── utils/                   # Middleware (auth, rate limiting), validation
│
├── embedding-worker/            # Python microservice
│   ├── worker.py                # SQS consumer (image → embedding → Pinecone)
│   ├── api.py                   # FastAPI text embedding endpoint
│   └── services/
│       ├── embedding_service.py # CLIP model (image + text embeddings)
│       ├── s3_service.py        # S3 image download
│       ├── sqs_service.py       # SQS message polling
│       └── pinecone_service.py  # Vector upsert
│
└── package.json                 # Root: concurrently runs client + server
```

### Authentication
JWT-based authentication. Tokens are sent via `Authorization: Bearer` header. Protected routes use `authMiddleware`. The LLM route additionally uses `express-rate-limit` (10 req/min per user).

### Security
- LLM outputs are validated (type/range checks on filters, format validation on dates).
- LLM-generated strings (album names, descriptions) are sanitized to prevent stored XSS.
- OpenAI structured outputs with JSON schema enforce response format.
- System prompt includes prompt injection defenses.
- All database queries use parameterized inputs.

---

## Roadmap / Missing Features

### Device Mode Separation
Currently, the app serves the same UI to all devices. In practice, the two main use cases target different form factors:
- **Management mode** (phone / tablet / desktop) — Uploading photos, organizing albums, creating AI albums. This is done from any device, anywhere.
- **Frame mode** (large screen / TV / dedicated display) — Running the slideshow. Typically a wall-mounted screen or a tablet left on a stand.

These two modes should eventually be split into distinct interfaces, possibly with a dedicated "kiosk mode" for the frame that hides all management UI and just runs the slideshow.

### Admin / User Management
- No admin console — user management is done directly in the database.
- No multi-user household support (e.g. shared albums, family groups).
- No user self-service (password reset, account deletion).

### Other Planned Features
- Internationalization (i18n) — text is currently hardcoded in English via `tempContent` objects, prepared for future extraction.
- Infinite scroll — photo library currently uses pagination; should transition to load-on-scroll.
- Photo metadata editor — view and edit EXIF data, add tags.
- Album sharing — public/private album links.
- Deployment tooling — Docker Compose for the full stack (client, server, worker, MySQL).

