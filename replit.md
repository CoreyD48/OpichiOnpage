# Opichi Onpage

**SEO Analysis Tool** - Discover what's keeping your page from ranking #1

## Overview

Opichi Onpage is an advanced SEO analysis tool that helps you understand why your web page isn't ranking as well as competitors for a target keyword. The app:

1. Takes a keyword and your page URL as input
2. Uses DataForSEO API to find the top 5 organic search results for that keyword
3. Uses Firecrawl API to scrape each competitor page (including HTML structure)
4. Uses Firecrawl API to scrape your provided URL
5. Uses Gemini 2.5 Pro to analyze all pages and provide an actionable checklist
6. Shows real-time analysis progress to keep users engaged
7. Displays a truncated preview with email unlock for the full report

## Project Architecture

### Frontend (React + Vite + TypeScript)
- **Location**: `client/`
- **Port**: 5000
- **Features**:
  - Form for keyword and URL input
  - Real-time progress display using Server-Sent Events
  - Email unlock feature for full analysis
  - Beautiful gradient UI with smooth animations

### Backend (Node.js + Express + TypeScript)
- **Location**: `server/`
- **Port**: 3001
- **Features**:
  - Express API server
  - Server-Sent Events for streaming progress
  - Integration with DataForSEO, Firecrawl, and Gemini APIs

### Services
1. **DataForSEO** (`server/src/services/dataforseo.ts`)
   - Fetches top 5 organic search results for a keyword
   - Uses SERP API Live mode

2. **Firecrawl** (`server/src/services/firecrawl.ts`)
   - Scrapes web pages including HTML and markdown
   - Handles JavaScript-rendered content

3. **Gemini** (`server/src/services/gemini.ts`)
   - Uses Gemini 2.5 Pro for AI analysis
   - Provides comprehensive SEO gap analysis
   - Generates actionable checklists

## Recent Changes

**October 27, 2025**
- Initial project setup
- Implemented frontend with React + Vite
- Implemented backend with Express + TypeScript
- Integrated DataForSEO, Firecrawl, and Gemini APIs
- Added Server-Sent Events for real-time progress updates
- Implemented email unlock feature
- Configured workflows to run both client and server

## Environment Variables

### Server (`server/.env`)
Required API keys:
- `DATAFORSEO_LOGIN` - Your DataForSEO login/username
- `DATAFORSEO_PASSWORD` - Your DataForSEO password
- `FIRECRAWL_API_KEY` - Your Firecrawl API key (starts with fc-)
- `GEMINI_API_KEY` - Your Google Gemini API key
- `PORT` - Server port (default: 3001)

### Client (`client/.env`)
- `VITE_API_URL` - Backend API URL (default: http://localhost:3001)

## How It Works

1. User enters a target keyword and their page URL
2. Frontend sends POST request to `/api/analyze`
3. Backend streams progress updates via Server-Sent Events:
   - Fetches top 5 organic results from DataForSEO
   - Scrapes each competitor page with Firecrawl
   - Scrapes user's page with Firecrawl
   - Analyzes all pages with Gemini AI
   - Generates actionable SEO checklist
4. Frontend displays truncated analysis
5. User enters email to unlock full report

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **APIs**: DataForSEO, Firecrawl, Gemini 2.5 Pro
- **Streaming**: Server-Sent Events (SSE)

## Development

Run both client and server:
```bash
bash start.sh
```

Or run separately:
```bash
# Server
cd server && npm run dev

# Client
cd client && npm run dev
```

## API Costs

- **DataForSEO SERP API**: ~$0.002 per search (Live mode)
- **Firecrawl**: Pay-per-scrape pricing
- **Gemini API**: Pay-per-token pricing

One analysis (1 keyword + 6 pages scraped + AI analysis) costs approximately:
- DataForSEO: $0.002
- Firecrawl: ~$0.006 (6 pages)
- Gemini: Variable based on content length

## User Preferences

None specified yet.
