# 🔧 CORS Troubleshooting Guide

## 🚨 **Understanding the CORS Error**

The error you're seeing is a **CORS (Cross-Origin Resource Sharing)** issue:

```
Access to fetch at 'https://your-ngrok-url.ngrok.io/auth/register' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

This happens because:
- Your frontend runs on `http://localhost:5173`
- Your backend runs on `https://your-ngrok-url.ngrok.io`
- The backend doesn't allow requests from your frontend domain

## 🛠️ **Solutions**

### **Option 1: Configure Backend CORS (Recommended)**

Your backend needs to allow requests from your frontend. Add these headers to your backend:

```python
# If using FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

```javascript
// If using Express.js
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### **Option 2: Use Vite Proxy (Development Only)**

I've configured a proxy in `vite.config.ts` that will handle CORS during development:

1. **Update your ngrok URL** in `vite.config.ts`:
   ```typescript
   target: 'https://your-actual-ngrok-url.ngrok.io',
   ```

2. **Restart your development server**:
   ```bash
   npm run dev
   ```

3. **The proxy will automatically route** `/api/*` requests to your backend

### **Option 3: Environment Variable**

Create a `.env` file in the `my-app` directory:

```bash
VITE_API_BASE_URL=https://your-actual-ngrok-url.ngrok.io
```

## 🔍 **Testing the Connection**

### **Step 1: Check if Backend is Running**

Test your backend directly:

```bash
curl -X OPTIONS https://your-ngrok-url.ngrok.io/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
```

### **Step 2: Check CORS Headers**

Look for these headers in the response:
- `Access-Control-Allow-Origin: http://localhost:5173`
- `Access-Control-Allow-Credentials: true`

### **Step 3: Test from Browser**

Open browser dev tools and test:

```javascript
fetch('https://your-ngrok-url.ngrok.io/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email: 'test@test.com', password: 'test' })
})
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: Backend Not Running**
**Error**: `net::ERR_FAILED`
**Solution**: Start your backend server

### **Issue 2: Wrong ngrok URL**
**Error**: `Failed to fetch`
**Solution**: Update the URL in `vite.config.ts` or `.env`

### **Issue 3: CORS Not Configured**
**Error**: `No 'Access-Control-Allow-Origin' header`
**Solution**: Configure CORS in your backend

### **Issue 4: Credentials Not Allowed**
**Error**: `Credentials flag is 'true' but the 'Access-Control-Allow-Credentials' header is ''`
**Solution**: Add `allow_credentials: true` to backend CORS config

## 🔧 **Quick Fix for Development**

If you want to test the frontend without fixing CORS immediately:

1. **Use the proxy** (already configured):
   - Update `vite.config.ts` with your actual ngrok URL
   - Restart the dev server

2. **Or use a CORS browser extension**:
   - Install "CORS Unblock" or similar extension
   - Enable it for development

## 📋 **Checklist**

- [ ] Backend server is running
- [ ] ngrok URL is correct and accessible
- [ ] CORS is configured in backend
- [ ] Frontend is using the correct API URL
- [ ] Development server is restarted after config changes

## 🎯 **Next Steps**

1. **Configure your backend CORS** (recommended for production)
2. **Update the ngrok URL** in `vite.config.ts`
3. **Restart your development server**
4. **Test the authentication flow**

## 📞 **Need Help?**

If you're still having issues:

1. Check the browser console for detailed error messages
2. Verify your backend is running and accessible
3. Test the API endpoints directly with curl or Postman
4. Ensure your ngrok URL is correct and not expired

The proxy configuration should resolve the CORS issue for development! 🚀 