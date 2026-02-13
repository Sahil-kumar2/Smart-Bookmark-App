# SmartMark

A production-ready bookmark management system with multi-user support, database-enforced security, and real-time synchronization.

**Live:** [https://smart-bookmark-app-nine-virid.vercel.app/](https://smart-bookmark-app-nine-virid.vercel.app/)

---

## Technical Summary

SmartMark is a full-stack web application implementing secure, multi-tenant bookmark management with real-time data synchronization. The architecture leverages PostgreSQL Row Level Security (RLS) for database-enforced user isolation, Supabase Realtime for event-driven updates, and Google OAuth for authentication. Built with Next.js 16 App Router and TypeScript, deployed on Vercel with production-grade environment configuration.

**Key Technical Features:**
- Database-enforced multi-tenancy via PostgreSQL RLS policies
- Real-time cross-tab synchronization using Postgres change data capture (CDC)
- OAuth 2.0 authentication flow with JWT-based session management
- Server-side rendering with client-side hydration for optimal performance
- Type-safe development with TypeScript across frontend and backend

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router) | React framework with SSR/SSG support |
| **Language** | TypeScript 5 | Type safety and developer experience |
| **Backend** | Supabase | Managed PostgreSQL, Auth, Realtime |
| **Database** | PostgreSQL | Relational database with RLS |
| **Styling** | Tailwind CSS 3 | Utility-first CSS framework |
| **Deployment** | Vercel | Edge network with automatic CI/CD |
| **Auth** | Google OAuth 2.0 | Third-party authentication provider |

---

## System Architecture

### Data Flow

```
User Action
    ↓
Google OAuth Provider
    ↓
Supabase Auth (JWT generation)
    ↓
Next.js Client (JWT in headers)
    ↓
PostgreSQL (RLS policy enforcement via auth.uid())
    ↓
Postgres Change Feed (CDC)
    ↓
Supabase Realtime (WebSocket)
    ↓
React State Update (all connected clients)
```

### Authentication Flow

1. User initiates Google OAuth via `signInWithOAuth()`
2. Redirect to Google consent screen
3. Callback to Supabase with authorization code
4. Supabase exchanges code for Google tokens
5. Supabase generates JWT with `user_id` claim
6. JWT stored in httpOnly cookie
7. Subsequent requests include JWT for RLS enforcement

### Real-time Synchronization

- Supabase Realtime subscribes to PostgreSQL replication slot
- Database changes trigger `postgres_changes` events
- WebSocket broadcasts events to all subscribed clients
- React components re-fetch data on event receipt
- Optimistic UI updates with server reconciliation

---

## Engineering Highlights

### Row Level Security (RLS)

PostgreSQL RLS policies enforce user isolation at the database layer, preventing unauthorized access even if application logic is bypassed.

**Policy Example:**
```sql
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);
```

- `auth.uid()` extracts user ID from JWT claims
- Policy evaluated on every query before row return
- Zero-trust architecture: application cannot override policies
- Prevents horizontal privilege escalation

### Realtime Event Handling

Supabase Realtime uses PostgreSQL's logical replication to stream database changes:

```typescript
supabase
  .channel("realtime-bookmarks")
  .on("postgres_changes", 
    { event: "*", schema: "public", table: "bookmarks" },
    () => fetchBookmarks()
  )
  .subscribe()
```

- Subscribes to all events (`INSERT`, `UPDATE`, `DELETE`) on `bookmarks` table
- Low-latency propagation via WebSocket connection
- Automatic reconnection with exponential backoff
- Scoped to user's data via RLS (server filters before broadcast)

### SSR vs Client-Side Rendering

**SSR (Server Components):**
- Layout and static content rendered server-side
- Reduces initial JavaScript bundle size
- Improves SEO and first contentful paint

**Client-Side (Client Components):**
- Interactive components (`BookmarkForm`, `BookmarkList`)
- Real-time subscriptions require browser WebSocket API
- State management with React hooks

**Decision Criteria:**
- Use Server Components for static content and layouts
- Use Client Components for interactivity and real-time features
- Marked with `'use client'` directive

### Environment Variable Management

**Development:**
- `.env.local` for local secrets (gitignored)
- `NEXT_PUBLIC_*` prefix for client-side variables

**Production (Vercel):**
- Environment variables set in Vercel dashboard
- Encrypted at rest and in transit
- Injected at build time for `NEXT_PUBLIC_*` variables
- Injected at runtime for server-only variables

---

## Features

### Authentication
- Google OAuth 2.0 integration
- Session management via JWT
- Automatic redirect on session expiry

### Bookmark Management
- **Create:** Add bookmarks with title and URL
- **Read:** View personal bookmark collection
- **Update:** Edit bookmark details via modal interface
- **Delete:** Remove bookmarks with instant feedback

### Search & Filter
- Real-time client-side filtering
- Case-insensitive search across title and URL fields
- Debounced input for performance

### User Experience
- Responsive design (mobile, tablet, desktop)
- Dark theme with glassmorphism effects
- Toast notifications for user feedback
- Loading skeletons during async operations
- Keyboard shortcuts (ESC to close modals, Enter to submit)

### Security
- Row Level Security for data isolation
- HTTPS-only in production
- Secure cookie storage for session tokens
- CSRF protection via SameSite cookies

---

## Production Considerations

### Environment Configuration

**Required Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Security Notes:**
- Anon key is safe for client-side use (RLS enforces permissions)
- Never expose service role key to client
- Rotate keys if compromised

### OAuth Redirect Configuration

**Development:**
```
http://localhost:3000
```

**Production:**
```
https://smart-bookmark-app-nine-virid.vercel.app
```

**Common Issues:**
- Redirect URI mismatch → 400 error from Google
- Missing trailing slash → redirect loop
- HTTP in production → blocked by OAuth provider

### WebSocket Connection Management

- Realtime connection established on component mount
- Cleanup on unmount to prevent memory leaks
- Automatic reconnection on network interruption
- Connection pooling handled by Supabase client

### Error Handling

**Strategy:**
- Specific error messages based on PostgreSQL error codes
- User-friendly messages for common scenarios
- Console logging for debugging (removed in production builds)

**Error Code Mapping:**
- `23505` → Duplicate entry
- `42501` → Permission denied (RLS)
- `23502` → Not null violation
- Network errors → Connection issues

---

## Challenges & Solutions

### Challenge 1: OAuth Redirect Mismatch
**Problem:** Google OAuth returned 400 error after authentication.

**Root Cause:** Redirect URI in Google Cloud Console didn't match the callback URL sent by Supabase.

**Solution:** 
- Verified exact redirect URI in Supabase dashboard
- Updated Google Cloud Console with exact match (including protocol and trailing slash)
- Tested with both development and production URLs

### Challenge 2: RLS Policy Blocking Updates
**Problem:** Bookmark updates showed success toast but didn't persist to database.

**Root Cause:** RLS enabled on table but `UPDATE` policy was missing.

**Solution:**
- Added comprehensive logging to capture Supabase response
- Identified empty data array in response (RLS block signature)
- Created missing UPDATE policy with proper `USING` and `WITH CHECK` clauses
- Verified all CRUD policies (SELECT, INSERT, UPDATE, DELETE)

### Challenge 3: Real-time Subscription Not Triggering
**Problem:** Changes in one tab didn't reflect in other tabs.

**Root Cause:** Realtime replication not enabled for `bookmarks` table.

**Solution:**
- Enabled replication in Supabase dashboard (Database → Replication)
- Verified WebSocket connection in browser DevTools
- Confirmed `postgres_changes` events firing in console

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- Supabase account
- Google Cloud Console project with OAuth credentials

### 1. Clone & Install
```bash
git clone <repository-url>
cd smart-bookmark-app
npm install
```

### 2. Database Setup

Run in Supabase SQL Editor:

```sql
-- Create table
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks"
  ON bookmarks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);
```

Enable Realtime: Database → Replication → `bookmarks` table

### 3. Configure OAuth

Supabase Dashboard → Authentication → Providers → Google:
- Add Client ID and Secret from Google Cloud Console
- Configure redirect URLs

### 4. Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 5. Run Development Server
```bash
npm run dev
```

---

## Deployment

### Vercel Deployment

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Update OAuth redirect URLs with Vercel domain
5. Deploy

**Post-Deployment:**
- Verify environment variables in Vercel dashboard
- Test OAuth flow with production URL
- Monitor WebSocket connections in browser console

---

## Project Structure

```
smart-bookmark-app/
├── app/
│   ├── globals.css           # Tailwind directives and global styles
│   ├── layout.tsx             # Root layout (SSR)
│   ├── page.tsx               # Dashboard (client component)
│   └── login/page.tsx         # OAuth login page
├── components/
│   ├── BookmarkForm.tsx       # Create bookmark form
│   ├── BookmarkList.tsx       # CRUD operations + realtime
│   ├── Navbar.tsx             # Search and user menu
│   └── ui/                    # Reusable components
│       ├── Modal.tsx          # Edit modal dialog
│       ├── Input.tsx          # Form input
│       ├── Button.tsx         # Button component
│       └── ...
├── lib/
│   ├── supabase.ts            # Supabase client singleton
│   ├── utils.ts               # Helper functions
│   └── errors.ts              # Error message mapping
└── .env.local                 # Environment variables (local)
```

---


## Author

**Sahil Kumar**  
Email: sahilkumar832832@gmail.com

---

**Stack:** Next.js • TypeScript • Supabase • PostgreSQL • Tailwind CSS • Vercel
