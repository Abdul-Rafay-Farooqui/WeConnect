# WEConnect Organization Module - Complete Setup Guide

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- Supabase account (free tier available)
- Next.js 16+ already installed (✅ Already in your project)
- Modern browser with WebRTC support

## 🔧 Installation Steps

### Step 1: Install Required Dependencies

```bash
npm install @supabase/supabase-js socket.io-client simple-peer express cors
```

These packages are already installed in your project.

### Step 2: Set Up Supabase

1. **Create a Supabase Project**
   - Visit [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and database configuration
   - Wait for project creation (2-3 minutes)

2. **Get Your API Keys**
   - Open your project dashboard
   - Go to Settings → API
   - Copy: `Project URL` and `Anon Key`

3. **Run the Database Schema**
   - Go to SQL Editor in Supabase
   - Click "New Query"
   - Copy entire contents of `COMPLETE_SCHEMA.sql`
   - Paste and run
   - Wait for all 23 tables to be created with RLS policies

4. **Enable Required Auth Policies**
   - Go to Authentication → Policies
   - Ensure "Enable RLS" is ON for all tables
   - Review RLS policies created with schema

### Step 3: Configure Environment Variables

Create `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# WebSocket Server
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:3001

# Optional: WebRTC Configuration
NEXT_PUBLIC_STUN_SERVERS=["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"]
```

### Step 4: Set Up WebSocket Server

1. **Create Server Entry Point** (`server.js` in root):

   ```bash
   node server/websocket-server.js
   ```

2. **Or Add NPM Script** in `package.json`:

   ```json
   "scripts": {
     "socket:dev": "node server/websocket-server.js",
     "socket:prod": "NODE_ENV=production node server/websocket-server.js",
     "dev": "next dev & npm run socket:dev"
   }
   ```

3. **Start WebSocket Server**:
   ```bash
   npm run socket:dev
   # Should show: "WebSocket server running on port 3001"
   ```

### Step 5: Start Development Server

```bash
npm run dev
# Next.js server starts on http://localhost:3000
```

## 🧪 Testing the Installation

1. **Verify Supabase Connection**
   - Open browser DevTools → Console
   - Navigate to any department page
   - Check if data loads from database without errors

2. **Verify WebSocket Connection**
   - Open Network tab in DevTools
   - Look for WebSocket connection to `ws://localhost:3001`
   - Should show "connected" status

3. **Test Real-Time Features**
   - Open 2 browser windows (same org/dept)
   - Send message in one window
   - Should appear instantly in other window
   - Check typing indicators work

4. **Test WebRTC (Optional)**
   - Go to Meetings tab
   - Create meeting and invite participant
   - Accept meeting in another window
   - Should see video/audio connection establish

## 📁 Key Project Files

| File                                             | Purpose                            |
| ------------------------------------------------ | ---------------------------------- |
| `lib/supabase-api-extended.js`                   | 71 API functions for all features  |
| `lib/webrtc.js`                                  | WebRTC peer connections manager    |
| `hooks/useWebSocket.js`                          | 5 custom React hooks for real-time |
| `server/websocket-server.js`                     | Socket.IO server on port 3001      |
| `src/components/organization/OrgViewComplete.js` | Main org module with 8 tabs        |
| `projectDetail/COMPLETE_SCHEMA.sql`              | Database schema (23 tables)        |

## 🎯 Module Features

- ✅ **Real-Time Chat** - WebSocket-powered messaging with typing indicators
- ✅ **File Sharing** - Upload/download department files
- ✅ **Meetings** - WebRTC video calls with screen sharing
- ✅ **Tasks** - Assignment and progress tracking
- ✅ **Attendance** - Sign in/out with timestamps
- ✅ **Approvals** - Workflows for requests
- ✅ **Praise** - Recognition and badges
- ✅ **Shifts** - Scheduling and assignments
- ✅ **Calendar** - Event management
- ✅ **Whiteboard** - Collaborative drawing (meetings)

## 🔒 Security Features

- Row-Level Security (RLS) on all tables
- JWT authentication via Supabase
- User isolation by department
- Rate limiting ready
- CORS configured

## 🚀 Production Deployment

1. **Environment Setup**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-production-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=production-key
   NEXT_PUBLIC_SOCKET_SERVER_URL=https://your-websocket-domain.com
   NODE_ENV=production
   ```

2. **Build Next.js**

   ```bash
   npm run build
   npm start
   ```

3. **Deploy WebSocket Server**
   - Use PM2, Docker, or cloud platform (Render, Railway, Heroku)
   - Ensure CORS allows your production domain

4. **Database Backups**
   - Supabase handles daily backups
   - Configure backup retention in settings

## 📞 Troubleshooting

### WebSocket Connection Fails

- Verify `NEXT_PUBLIC_SOCKET_SERVER_URL` matches actual server URL/port
- Check firewall allows port 3001
- Verify server is running: `curl http://localhost:3001/health`

### Supabase Connection Fails

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check RLS policies aren't blocking read access
- Check network tab - look for auth errors

### Messages Not Appearing

- Open DevTools → Network → WS
- Check WebSocket connection status
- Verify message sent to correct department
- Check user is member of department

### Video Not Working

- Verify `simple-peer` and WebRTC dependencies installed
- Check browser permissions for camera/microphone
- Verify STUN servers accessible (not blocked by firewall)
- Test with latest Chrome/Firefox

## 📖 Next Steps

1. Fill in `.env.local` with your Supabase credentials
2. Run `COMPLETE_SCHEMA.sql` in Supabase SQL editor
3. Start WebSocket server: `npm run socket:dev`
4. Start Next.js: `npm run dev`
5. Import `OrgViewComplete.js` in your app
6. Test each tab (chat, files, meetings, tasks, etc.)
7. Customize styling and add business logic as needed

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Socket.IO Documentation](https://socket.io/docs/)
- [WebRTC & simple-peer](https://github.com/feross/simple-peer)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Setup Time:** ~15 minutes | **Complexity:** Medium | **Support:** Check projectDetail folder for more guides
