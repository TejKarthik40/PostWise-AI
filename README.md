# PostWise-AI - AI Social Media Content Calendar Generator

**PostWise-AI** is a modern, full-stack AI-powered social media management platform that transforms brand identity, voice guidelines, and marketing goals into a complete **30-day social media calendar** for **Instagram**, **LinkedIn**, and **X (Twitter)**.

Built with a **Node.js/Express** backend, **MongoDB (Mongoose)** with compound database indexing and an automatic in-memory fallback, and a reactive **React + Vite** frontend styled with **Tailwind CSS**.

---

## Key Features

### 1. 30-Day AI Content Calendar Generation
- **One-Click Generation**: Automatically generates a 30-day publishing schedule complete with hooks, captions, hashtag clusters, visual prompts, and strategic engagement tips.
- **Platform-Specific Rules & Voice**:
  - **Instagram**: Visual vibe, emoji accents, conversational spacing, and strong calls-to-action (CTAs).
  - **LinkedIn**: High-value professional thought leadership, analytical insights, and structured bullet points.
  - **X (Twitter)**: Impactful, concise hooks strictly validated under the 280-character limit.
- **Asynchronous Job Mode (`/generate-async`)**: Allows long-running calendar generation to run in background jobs with status tracking endpoints (`/api/calendars/jobs/:jobId`).
- **AI Model Flexibility**: Powered by **Groq API** (`llama-3.3-70b-versatile`) with built-in fallback to **OpenAI** (`gpt-4o-mini`) and an intelligent offline mock generator when API keys are absent.

### 2. Security & Request Validation
- **Server-Side Input Validation**: Powered by **Zod** schemas enforcing strict request body, route parameter, and query string validation.
- **Security Headers & Protection**: Hardened HTTP security headers powered by **Helmet**.
- **Endpoint Rate Limiting**: Dedicated rate limiters using `express-rate-limit` for authentication (`/api/auth/*`) and heavy AI endpoints (`/api/calendars/generate`, `/api/posts/:id/regenerate`).
- **Sensitive Data Redaction**: Automatic stripping and masking of passwords, JWT tokens, and API credentials in logs.

### 3. Pexels Stock Photo Integration & Carousel
- **Dynamic Content Matching**: Generates concise search terms (1 to 3 words) extracted from post titles and captions.
- **In-Memory Cache (10-Minute TTL)**: Caches search results on the backend for 10 minutes to minimize API consumption and optimize load times.
- **Multi-Photo Carousel (`PexelsCarousel`)**: Displays 1 to 3 suggested high-resolution images with slide controls and dot indicators.
- **Live Post Feed Previews**: Renders matched Pexels imagery directly within real-time Instagram, LinkedIn, and X post preview cards.

### 4. Full-Screen Interactive Post Editor
- **Multi-Platform Live Simulation**: Instantly preview how a post will look on Instagram, LinkedIn, and X/Twitter.
- **Single-Post AI Regeneration**: Re-craft individual post copy with custom prompts (e.g., *"Make it punchier with a question hook"*) without altering the rest of the calendar.
- **Live Character & Word Counters**: Real-time counter widgets with visual alerts for X (280 chars).

### 5. Interactive Content Calendar & Rescheduling
- **Multiple Views**: Seamlessly switch between **Month Grid**, **Week View**, and **Agenda List**.
- **Drag-and-Drop Rescheduling**: Move posts across calendar dates with smooth, instant state updates.
- **Publish Status Control**: Track and toggle posts across `draft`, `scheduled`, and `published` states.
- **Direct LinkedIn Publishing**: 1-click publishing of scheduled content directly to live LinkedIn feeds via LinkedIn REST Posts API (`/rest/posts`).

### 6. Automated Testing & Observability
- **Automated Test Suite**: Built with **Jest** and **Supertest** covering Authentication, Zod Schema Validation, AI Output Validation, Calendar Generation, Post Rescheduling, and Exports.
- **Structured JSON Logging**: Standardized structured logger (`utils/logger.js`) with contextual metadata, event levels (`INFO`, `WARN`, `ERROR`), and automatic credential sanitization.

### 7. Export & Database Performance
- **JSON & CSV Export**: Download complete 30-day schedules for external tools (Buffer, Hootsuite, Notion).
- **Compound Database Indexing**: Optimized MongoDB schemas with indexes on `{ user: 1, date: 1 }`, `{ calendar: 1, date: 1 }`, and `{ user: 1, name: 1 }`.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React Icons, React Router DOM |
| **Backend** | Node.js (v18+), Express.js, Zod, Helmet, Express-Rate-Limit, Swagger UI |
| **Database** | MongoDB with Mongoose (Compound Indexes + automated in-memory fallback) |
| **Testing** | Jest, Supertest |
| **Logging** | Custom Structured Logger with Redaction (`utils/logger.js`) |
| **AI & Media APIs** | Groq API (`llama-3.3-70b-versatile`), OpenAI API, Pexels API |
| **Authentication**| JSON Web Tokens (JWT), bcryptjs |

---

## Environment Variables Configuration

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/postwise_ai
JWT_SECRET=your_super_secret_jwt_key_here

# AI Engine (Groq is prioritized; OpenAI is optional fallback)
GROQ_API=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
# OPENAI_API_KEY=sk-your_openai_key_here

# Pexels API
PEXELS_API=your_pexels_api_key_here

# LinkedIn OAuth & Publishing
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:5000/api/linkedin/auth/callback
LINKEDIN_ACCESS_TOKEN=your_direct_linkedin_access_token
```

---

## Interactive Swagger API Documentation

PostWise-AI includes an interactive **OpenAPI 3.0 / Swagger UI** documentation interface.

- **Swagger UI Interactive Explorer**: Visit **`http://localhost:5000/api/docs`** in your browser when the server is running to test API endpoints interactively.
- **OpenAPI JSON Spec**: **`http://localhost:5000/api/docs.json`**

---

## Backend API Endpoints Reference

All secured routes require a Bearer token in the `Authorization` header:
`Authorization: Bearer <jwt_token>`

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Validation / Rate Limit |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new user account | Zod validated / Rate limited (20 req / 15m) |
| `POST` | `/api/auth/login` | Login and obtain JWT token | Zod validated / Rate limited (20 req / 15m) |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Bearer Token Required |

### 2. Brand Profiles (`/api/brands`)
| Method | Endpoint | Description | Validation |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/brands` | List user brands (auto-seeds default if empty) | Bearer Token |
| `POST` | `/api/brands` | Create new brand profile | Zod `createBrandSchema` |
| `GET` | `/api/brands/:id` | Retrieve single brand profile | Bearer Token |
| `PUT` | `/api/brands/:id` | Update brand profile | Zod `updateBrandSchema` |
| `DELETE` | `/api/brands/:id` | Delete brand profile | Bearer Token |

### 3. Calendar Engine (`/api/calendars`)
| Method | Endpoint | Description | Validation / Rate Limit |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/calendars/generate` | Synchronous 30-day AI calendar generation | Zod validated / AI Rate Limit (30 req / 15m) |
| `POST` | `/api/calendars/generate-async`| Asynchronous background job generation | Zod validated / AI Rate Limit (30 req / 15m) |
| `GET` | `/api/calendars/jobs/:jobId` | Poll background job status & result | Bearer Token |
| `GET` | `/api/calendars` | List all calendars for authenticated user | Bearer Token |
| `GET` | `/api/calendars/:id` | Get calendar details and all posts | Bearer Token |
| `GET` | `/api/calendars/:id/export/json`| Download calendar as JSON file | Bearer Token |
| `GET` | `/api/calendars/:id/export/csv` | Download calendar as CSV file | Bearer Token |
| `DELETE` | `/api/calendars/:id` | Delete calendar and associated posts | Bearer Token |

### 4. Post Operations (`/api/posts`)
| Method | Endpoint | Description | Validation / Rate Limit |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/posts` | Manually add a post to a calendar | Zod `createPostSchema` |
| `PUT` | `/api/posts/:id` | Update post details or status | Zod `updatePostSchema` |
| `POST` | `/api/posts/:id/regenerate` | Single-post AI regeneration | Zod validated / AI Rate Limit |
| `PATCH` | `/api/posts/:id/reschedule` | Reschedule post date | Zod `reschedulePostSchema` |
| `DELETE` | `/api/posts/:id` | Delete a single scheduled post | Bearer Token |
| `POST` | `/api/posts/:id/publish/linkedin` | Publish post directly to LinkedIn feed | Bearer Token |

---

## Testing & Verification

Run the automated test suite in the `backend` directory:
```bash
cd backend
npm test
```

The Jest test suite executes:
- `auth.test.js`: User registration, login, and JWT verification.
- `validation.test.js`: Zod schema edge cases.
- `aiService.test.js`: AI response parsing, platform content limits, and fallback generation.
- `calendar.test.js`: Synchronous & asynchronous calendar generation, JSON/CSV exports.
- `post.test.js`: Post creation, update, rescheduling, and regeneration.

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later
- **MongoDB** *(Optional)*: If local MongoDB is disconnected, PostWise-AI automatically runs in fallback in-memory mode.

### Step 1: Install Dependencies & Setup
```bash
# Backend setup
cd backend
npm install
cp .env.example .env

# Frontend setup
cd ../frontend
npm install
```

### Step 2: Run Development Servers
```bash
# Start backend server (port 5000)
cd backend
npm run dev

# In a new terminal, start frontend dev server (port 3000)
cd frontend
npm run dev
```

Visit **`http://localhost:3000`** to launch the PostWise-AI interface.

---

## License
MIT License. Built for content creators, agencies, and marketing teams.
