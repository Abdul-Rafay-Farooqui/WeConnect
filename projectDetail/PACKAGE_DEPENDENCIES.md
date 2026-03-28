# WEConnect - Package Dependencies & NPM Scripts

## 📦 Installed Packages

### Core Dependencies

| Package     | Version | Purpose         |
| ----------- | ------- | --------------- |
| `next`      | 16.1.6  | React framework |
| `react`     | 19.2.3  | UI library      |
| `react-dom` | 19.2.3  | DOM rendering   |

### Backend & Database

| Package                 | Version | Purpose                       |
| ----------------------- | ------- | ----------------------------- |
| `@supabase/supabase-js` | latest  | PostgreSQL database client    |
| `express`               | 4.x     | Node.js server framework      |
| `cors`                  | latest  | Cross-origin request handling |
| `dotenv`                | latest  | Environment variables         |

### Real-Time & WebSocket

| Package            | Version | Purpose          |
| ------------------ | ------- | ---------------- |
| `socket.io`        | 4.x     | WebSocket server |
| `socket.io-client` | 4.x     | WebSocket client |

### WebRTC & Media

| Package       | Version | Purpose                 |
| ------------- | ------- | ----------------------- |
| `simple-peer` | 9.x     | WebRTC peer connections |

### Styling

| Package        | Version | Purpose               |
| -------------- | ------- | --------------------- |
| `tailwindcss`  | 4.x     | CSS utility framework |
| `postcss`      | latest  | CSS processing        |
| `autoprefixer` | latest  | CSS vendor prefixes   |

### Development Dependencies (Optional)

| Package      | Version | Purpose       |
| ------------ | ------- | ------------- |
| `eslint`     | 9.x     | Code linting  |
| `typescript` | 5.x     | Type checking |

## ✅ Installation Command

All required packages are pre-installed:

```bash
npm install
```

Or install individually:

```bash
npm install @supabase/supabase-js socket.io-client simple-peer express cors
```

## 📜 NPM Scripts

Add these to your `package.json` scripts section:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "socket:dev": "node server/websocket-server.js",
    "socket:prod": "NODE_ENV=production node server/websocket-server.js",
    "dev:all": "concurrently \"npm run dev\" \"npm run socket:dev\""
  }
}
```

### Script Descriptions

| Script        | Command                                               | Purpose                              |
| ------------- | ----------------------------------------------------- | ------------------------------------ |
| `dev`         | `next dev`                                            | Start Next.js dev server (port 3000) |
| `build`       | `next build`                                          | Build for production                 |
| `start`       | `next start`                                          | Start production server              |
| `lint`        | `next lint`                                           | Run ESLint                           |
| `socket:dev`  | `node server/websocket-server.js`                     | Start WebSocket server (port 3001)   |
| `socket:prod` | `NODE_ENV=production node server/websocket-server.js` | Start WebSocket server (production)  |
| `dev:all`     | Run dev + socket:dev concurrently                     | Start both servers together          |

## 🚀 Starting the Application

### Option 1: Both servers in separate terminals

**Terminal 1 - Next.js Frontend**

```bash
npm run dev
# Output: ▲ Next.js 16.1.6
#         Local:        http://localhost:3000
```

**Terminal 2 - WebSocket Server**

```bash
npm run socket:dev
# Output: WebSocket server running on port 3001
#         Health check: GET http://localhost:3001/health
```

### Option 2: Both servers together (requires concurrently)

```bash
npm install -D concurrently
npm run dev:all
```

## 📋 Dependency Tree (Simplified)

```
weconnect/
├── node_modules/
│   ├── next/
│   │   └── requires react, react-dom
│   ├── @supabase/supabase-js/
│   │   └── for PostgreSQL & auth
│   ├── socket.io/
│   │   └── for WebSocket server
│   ├── socket.io-client/
│   │   └── for WebSocket client
│   ├── simple-peer/
│   │   └── for WebRTC
│   ├── express/
│   │   └── for Node.js server
│   ├── tailwindcss/
│   │   └── for styling
│   └── ... (dependencies of above)
│
├── package.json
├── package-lock.json
└── [source files]
```

## 🔍 Checking Package Versions

```bash
# Check all installed packages
npm list

# Check specific package
npm list socket.io

# Check latest available version
npm view socket.io latest

# Update packages
npm update [package-name]
```

## ⚠️ Known Vulnerabilities (Dev Only)

The project has been tested with current package versions. Development environment may show minor vulnerability alerts which are acceptable for development but should be addressed before production deployment.

```bash
# Audit packages
npm audit

# Fix vulnerabilities
npm audit fix

# Force security update
npm audit fix --force
```

## 🔐 Production Recommendations

For production deployment:

1. **Update all packages to latest stable versions**

   ```bash
   npm update
   npm audit fix
   ```

2. **Use package-lock.json for consistent installs**

   ```bash
   npm ci  # Instead of npm install
   ```

3. **Set production environment**

   ```bash
   NODE_ENV=production npm run build
   npm start
   ```

4. **Security recommendations**
   - Use `.npmrc` to lock versions
   - Enable npm audit in CI/CD pipeline
   - Regularly update dependencies
   - Use npm shrinkwrap for critical projects

## 🐳 Docker Setup (Optional)

### Dockerfile Example

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

# Expose ports
EXPOSE 3000 3001

# Start both servers
CMD ["npm", "run", "dev:all"]
```

### docker-compose.yml Example

```yaml
version: "3.8"

services:
  weconnect:
    build: .
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:3001
    volumes:
      - .:/app
      - /app/node_modules
```

## 📝 Common Package Commands

```bash
# Install new package
npm install package-name

# Install dev dependency
npm install --save-dev package-name

# Remove package
npm uninstall package-name

# List globally installed packages
npm list -g

# Check outdated packages
npm outdated

# Run a script from node_modules
npx eslint .
```

## 🚨 Troubleshooting Package Issues

### Issue: Module not found

```bash
# Clear npm cache
npm cache clean --force

# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port already in use

```bash
# Change port for Next.js
PORT=3001 npm run dev

# Change port for WebSocket
SOCKET_PORT=3002 npm run socket:dev
```

### Issue: Strange behavior after package update

```bash
# Revert to previous version
npm install socket.io@4.5.0

# Or check if lock file is outdated
npm ci  # Install from lock file instead of latest
```

## 📊 Package Size Analysis

```bash
# Analyze bundle size
npm install -D @next/bundle-analyzer

# Then configure next.config.js:
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer({})

# Run analysis
ANALYZE=true npm run build
```

## 🔄 Keeping Dependencies Updated

### Manual approach

```bash
# Check what can be updated
npm outdated

# Update minor versions
npm update

# Check latest breaking changes
npm view [package-name] versions
```

### Automatic approach (requires Dependabot or similar)

- Enable GitHub Dependabot for automatic PRs
- Configure `.github/dependabot.yml`
- Review and merge dependency update PRs

## 📚 Package.json Template

Below is the recommended package.json structure:

```json
{
  "name": "weconnect",
  "version": "1.0.0",
  "description": "Organization team collaboration platform",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "socket:dev": "node server/websocket-server.js",
    "socket:prod": "NODE_ENV=production node server/websocket-server.js"
  },
  "dependencies": {
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "@supabase/supabase-js": "latest",
    "socket.io": "latest",
    "socket.io-client": "latest",
    "simple-peer": "latest",
    "express": "latest",
    "cors": "latest",
    "tailwindcss": "4",
    "postcss": "latest",
    "autoprefixer": "latest"
  },
  "devDependencies": {
    "eslint": "latest",
    "eslint-config-next": "latest"
  }
}
```

---

**Package Guide Version**: 1.0 | **Last Updated**: 2024
