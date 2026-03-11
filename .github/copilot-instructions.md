# What-to-Eat Codebase Guidelines

## Architecture Overview

This is a full-stack Vue.js + Express.js application for a food management system with user authentication and inventory tracking.

### Tech Stack
- **Frontend**: Vue.js 3 with Composition API, Element Plus, Vue Router 4
- **Backend**: Express.js (Node.js), running on port 5000
- **Database**: MySQL (host: localhost, user: root, password: 123456, db: what_to_eat)
- **Authentication**: JWT tokens with express-jwt middleware
- **HTTP Client**: Axios with request interceptor

### Key Components & Data Flow

```
Frontend (src/) → Axios Request → Backend Express (serve/) → MySQL
     ↓
- Login/Auth via `/login/checklogin`
- Account routes: `/account/*`
- Goods routes: `/goods/*`
- Inventory routes: `/inventory/*`
```

## Development Workflows

### Frontend Development
```bash
cd .  # workspace root
npm install
npm run serve       # Starts dev server (hot reload)
npm run build       # Production build
npm run lint        # Lint & fix code
```

### Backend Development
```bash
cd serve
npm install
npm start           # Uses nodemon for auto-reload on port 5000
```

**Critical**: Backend must run separately; it's not served by Vue CLI.

## Key Code Patterns

### Vue 3 Component Structure
- **Composition API**: All components use `<script setup>` syntax
- **Reactivity**: Use `ref()` for primitive values, `reactive()` for objects
- **Template Refs**: Access DOM/component refs with `ref()` and `.value`
- **Lifecycle**: Use `onMounted()`, `onUnmounted()` etc. instead of Options API
- **Deep Selectors**: Use `:deep()` instead of `::v-deep` in scoped styles

### Authentication & Token Management
- **JWT Secret**: `'itsource'` (defined in `serve/routes/*.js`)
- **Token Storage**: Stored in localStorage under key `'user_token'`
- **Request Interceptor** (`src/utils/request.js`): Automatically adds `Authorization: Bearer <token>` header
- **Route Protection** (`src/main.js`): Router guard redirects unauthenticated users to `/login`
- **Backend Middleware** (`serve/routes/*.js`): Express-JWT validates all endpoints except `/login/checklogin`

### Database Access Pattern
- Direct MySQL connection (`serve/routes/js/mysql.js`) shared across all routes
- **WARNING**: Routes use string concatenation for SQL (SQL injection risk); consider parameterized queries
- Routes: `account.js` (user mgmt), `login.js` (auth), `goods.js` (products), `inventory.js` (stock)

### API Request Pattern
```javascript
// In frontend: src/api/login.js
import axios from "../utils/request";
export function checkLogin(params){
    return axios.post("/login/checklogin", params)
}

// Usage in Vue 3 components with Composition API:
import { checkLogin } from "../api/login"
checkLogin({account, password}).then(response => {...})
```

### Element Plus Usage
```javascript
// Import message component
import { ElMessage } from 'element-plus'

// Usage
ElMessage({ type: 'success', message: '操作成功' })
ElMessage.error('操作失败')
```

### Local Storage Utility
```javascript
// src/utils/local.js - simple wrapper for localStorage
local.save('key', value)   // Serializes to JSON
local.get('key')           // Deserializes from JSON
local.remove('key')
```

## Project-Specific Conventions

- **Backend Base URL**: Frontend axios defaults to `http://127.0.0.1:5000`
- **Date Format**: Server uses `YYYY-MM-DD HH:MM:SS` format
- **Cross-Origin**: CORS enabled globally in `serve/app.js`; additional CORS headers in each route's `router.all("*", ...)`
- **Default Avatar**: New accounts assigned `/upload/portrait.jpg`
- **File Uploads**: Handled via multer middleware (configured in serve/package.json, routes not yet integrated)

## Important File References

- `src/main.js` - Router guard, Vue initialization, Element UI setup
- `src/router.js` - Routes: `/login`, `/section` (main dashboard)
- `serve/app.js` - Express app setup, CORS configuration, port 5000
- `serve/routes/js/mysql.js` - Database connection (hardcoded credentials)
- `src/utils/request.js` - Axios client with auth interceptor
- `src/views/login.vue` - Login & registration UI using Element UI tabs

## Common Issues & Notes

- **SQL Injection**: Routes use string concatenation—use parameterized queries in new endpoints
- **Environment Variables**: Database credentials hardcoded; should use `.env` files
- **CORS Duplication**: Both `app.js` and individual routes define CORS headers
- **Node modules**: Run `npm install` separately in root and `serve/` directory

## Additional Routes Available
- `/account/` - account operations (CRUD)
- `/goods/` - product management
- `/inventory/` - stock management  
- `/vipaccount/` - VIP account features (not yet integrated)
