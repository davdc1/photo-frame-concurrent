# Photo Frame

A full-stack photo management and digital photo frame application that combines traditional photo organization with AI-powered natural language search and semantic image retrieval.

Live app at: https://photo-frame-app.fly.dev

## Highlights

- Built a distributed architecture with separate **React**, **Node.js**, and Python services.
- Implemented semantic image search using **CLIP embeddings** and **Pinecone** vector search.
- Designed an AI-powered album creation pipeline that converts natural language queries into structured metadata filters and vector searches.
- Implemented direct-to-S3 uploads using presigned URLs to avoid routing large files through the application server.
- Built asynchronous image processing using **SQS** and a dedicated embedding worker.
- Created a slideshow engine with session persistence, playlist support, and configurable transitions.

## Key Features

### AI-Powered Album Creation

Users can create albums using natural language:

> *"sunset photos from last summer"*

The query is processed through a multi-stage pipeline:

1. **OpenAI** extracts structured filters (date ranges, locations, orientation, etc.).
2. Location names are geocoded into geographic boundaries.
3. **MySQL** applies metadata filtering.
4. **Pinecone** performs semantic similarity search using CLIP embeddings.
5. Results are combined into a generated album with an AI-generated title and description.

### Semantic Image Search

Every uploaded photo is embedded using OpenAI's CLIP model and stored in Pinecone.

This enables searches based on image content rather than manually assigned tags:

- *"dogs"*
- *"people at a party"*
- *"mountain landscapes"*

### Digital Photo Frame

A full-screen slideshow system supporting:

- Entire photo library playback
- Album-based playlists
- Random or sequential ordering
- Configurable intervals and transitions
- Persistent sessions that resume from the previously displayed photo

### Photo & Album Management

- Photo uploads and deletion
- Album creation and organization
- Drag-and-drop photo reordering
- Album cover management
- Responsive photo library browsing

---

## Architecture

The application consists of three independently deployable services:

| Service | Technology |
|---------|------------|
| **Frontend** | React, React Router, SCSS |
| **Backend API** | Node.js, Express, Knex, Objection.js |
| **Embedding Worker** | Python, FastAPI, PyTorch, CLIP |

### Infrastructure

| Component | Purpose |
|-----------|---------|
| **MySQL** | Application data and metadata |
| **AWS S3** | Image storage |
| **AWS SQS** | Asynchronous processing queue |
| **Pinecone** | Vector database |
| **OpenAI API** | Query understanding |
| **Nominatim** | Geocoding |

### Upload & Embedding Pipeline

```
Client
  │
  ├─ Request upload URL
  ▼
Express API
  │
  ├─ Generate presigned URL
  ▼
S3
  ▲
  │
Client uploads image directly
  │
  └─ Upload complete
          │
          ▼
        SQS
          │
          ▼
  Embedding Worker
          │
          ├─ Download image
          ├─ Generate CLIP embedding
          └─ Store vector in Pinecone
```

### Search Pipeline

```
Natural Language Query
          │
          ▼
       OpenAI
          │
          ▼
 Structured Filters
          │
          ├─ Metadata Search (MySQL)
          └─ Semantic Search (Pinecone)
                     │
                     ▼
             Combined Results
                     │
                     ▼
              Generated Album
```

---

## Technical Details

### Authentication & Security

- JWT-based authentication
- Protected API routes
- Rate limiting on AI endpoints
- Parameterized SQL queries
- Structured LLM outputs using JSON schema validation
- Sanitization of AI-generated content to prevent stored XSS
- Validation of all LLM-generated filters before execution

### Performance Considerations

- Direct browser-to-S3 uploads reduce API server load.
- Asynchronous embedding generation prevents upload delays.
- Thumbnail generation minimizes bandwidth consumption.
- Slideshow prefetching reduces image transition latency.
- Pagination limits photo library payload size.

---

## Challenges Solved

### Combining Metadata and Semantic Search

Pure vector search often returns visually similar images that do not satisfy user constraints.

To improve relevance, searches first apply metadata filters (dates, location, orientation) and then intersect those results with Pinecone semantic matches, producing more accurate albums.

### Long-Running Image Processing

Generating image embeddings can be computationally expensive.

Instead of processing uploads synchronously, uploads publish jobs to SQS and return immediately. A dedicated Python worker performs embedding generation independently of the API lifecycle.

---

## Roadmap / Future Improvements

- Dedicated kiosk interface for frame-only devices
- Shared family albums and multi-user collaboration
- Password reset and account self-service
- Photo tagging and metadata editing
- Public album sharing