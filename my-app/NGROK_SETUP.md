# 🔧 ngrok URL Setup Guide

## 🚨 **Current Issue**
You're getting a 404 error because the ngrok URL in `vite.config.ts` is still set to the placeholder value.

## 🛠️ **How to Fix**

### **Step 1: Get Your ngrok URL**

1. **Start your backend server** (if not already running)
2. **Start ngrok** pointing to your backend port:
   ```bash
   ngrok http 8000  # or whatever port your backend uses
   ```
3. **Copy the HTTPS URL** from ngrok output (looks like `https://abc123.ngrok.io`)

### **Step 2: Update vite.config.ts**

Replace the placeholder URL in `vite.config.ts`:

```typescript
// Change this line:
target: 'https://your-ngrok-url.ngrok.io',

// To your actual ngrok URL:
target: 'https://abc123.ngrok.io',  // Replace with your actual URL
```

### **Step 3: Test the Connection**

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test the API endpoint** in your browser console:
   ```javascript
   fetch('/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email: 'test@test.com', password: 'test' })
   })
   ```

## 🔍 **Troubleshooting**

### **If you don't have ngrok:**
1. **Install ngrok**: https://ngrok.com/download
2. **Sign up for free account** to get your authtoken
3. **Configure ngrok**: `ngrok config add-authtoken YOUR_TOKEN`

### **If ngrok URL is not working:**
1. **Check if backend is running** on the correct port
2. **Verify ngrok is pointing to the right port**
3. **Test the ngrok URL directly** in browser

### **If still getting 404:**
1. **Check the API endpoint path** - should be `/auth/register`
2. **Verify your backend has this endpoint**
3. **Check backend logs** for any errors

## 📋 **Quick Checklist**

- [ ] Backend server is running
- [ ] ngrok is running and pointing to backend
- [ ] Updated `vite.config.ts` with correct ngrok URL
- [ ] Restarted development server
- [ ] Tested API endpoint

## 🎯 **Example Configuration**

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://abc123.ngrok.io',  // Your actual ngrok URL
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

## 🚀 **Next Steps**

1. **Get your ngrok URL**
2. **Update `vite.config.ts`**
3. **Restart the dev server**
4. **Test the signup form**

Let me know your actual ngrok URL and I can help you update the configuration! 🚀 