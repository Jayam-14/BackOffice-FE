# 🚀 Quick Setup Guide

## 1. Configure API Base URL

### Option A: Environment Variable (Recommended)

Create a `.env` file in the `my-app` directory:

```bash
# my-app/.env
VITE_API_BASE_URL=https://your-ngrok-url.ngrok.io
```

### Option B: Direct Configuration

Edit `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: "https://your-ngrok-url.ngrok.io",
  // ... rest of config
};
```

## 2. Replace ngrok URL

Replace `https://your-ngrok-url.ngrok.io` with your actual ngrok URL from the backend.

## 3. Install Dependencies

```bash
cd my-app
npm install
```

## 4. Start Development Server

```bash
npm run dev
```

## 5. Test the Integration

1. Open the application in your browser
2. Navigate to `/test` to see the test login page
3. Use one of the test accounts to log in:
   - **Sales Executive**: john.smith@company.com / 123456
   - **Pricing Analyst**: sarah.analyst@company.com / 123456

## 6. Verify API Connection

Check the browser console for:
- ✅ API requests being made
- ✅ Successful authentication
- ✅ Data loading from backend

## 🎯 What's Integrated

- ✅ **Authentication**: Login, logout, session management
- ✅ **Sales Dashboard**: Create, view, edit, delete PRs
- ✅ **Analyst Dashboard**: Review, approve, reject PRs
- ✅ **Error Handling**: Network errors, API errors
- ✅ **Loading States**: Better user experience
- ✅ **Data Transformation**: Frontend ↔ API format conversion

## 🚨 Troubleshooting

### CORS Issues
Ensure your backend allows requests from `http://localhost:5173`

### Authentication Failures
Check that cookies are being sent with requests

### API Timeouts
Verify your ngrok URL is accessible and the backend is running

## 📚 Next Steps

1. Set up your backend with ngrok
2. Update the API base URL
3. Test the authentication flow
4. Create and manage pricing requests
5. Test the approval workflow

The frontend is now fully integrated with the backend APIs! 🎉 