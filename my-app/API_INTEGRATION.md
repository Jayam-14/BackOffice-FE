# API Integration Guide

This document explains how to configure and use the backend API integration in the BackOffice Frontend application.

## 🔧 Configuration

### 1. Set API Base URL

You have two options to configure the API base URL:

#### Option A: Environment Variable (Recommended)
Create a `.env` file in the `my-app` directory:

```bash
VITE_API_BASE_URL=https://your-ngrok-url.ngrok.io
```

#### Option B: Direct Configuration
Edit `src/config/api.ts` and update the `BASE_URL`:

```typescript
export const API_CONFIG = {
  BASE_URL: "https://your-ngrok-url.ngrok.io",
  // ... rest of config
};
```

### 2. Update ngrok URL

Replace `https://your-ngrok-url.ngrok.io` with your actual ngrok URL from the backend.

## 🚀 Features Integrated

### Authentication
- ✅ User registration with role selection (SE/PA)
- ✅ User login with email/password
- ✅ User logout
- ✅ Session management with cookies

### Sales Executive Features
- ✅ Create pricing requests (save as draft)
- ✅ Submit pricing requests for review
- ✅ View all pricing requests with filtering
- ✅ Update draft pricing requests
- ✅ Delete pricing requests
- ✅ Resubmit action required requests

### Pricing Analyst Features
- ✅ View available pricing requests
- ✅ View assigned pricing requests
- ✅ Assign pricing requests to self
- ✅ Approve pricing requests
- ✅ Reject pricing requests
- ✅ Mark as action required with comments

## 📁 File Structure

```
src/
├── config/
│   └── api.ts              # API configuration
├── services/
│   ├── api.ts              # Core API functions
│   └── prService.ts        # PR-specific API services
├── contexts/
│   └── AuthContext.tsx     # Updated to use real API
├── pages/
│   ├── SalesDashboard.tsx  # Updated to use real API
│   └── AnalystDashboard.tsx # Updated to use real API
└── types/
    └── index.ts            # Updated types for API compatibility
```

## 🔄 Data Transformation

The application includes data transformation utilities to convert between frontend and API formats:

### Frontend → API
```typescript
// Example: Converting frontend PR data to API format
const apiData = transformPRData.toAPI(frontendData);
```

### API → Frontend
```typescript
// Example: Converting API PR data to frontend format
const frontendData = transformPRData.fromAPI(apiData);
```

## 🛠️ Error Handling

The API integration includes comprehensive error handling:

- Network errors are caught and logged
- API errors with details are thrown
- Authentication errors redirect to login
- Loading states are managed with React Query

## 🔐 Authentication Flow

1. **Login**: User enters email/password → API call → Store user data
2. **Session**: Cookies are automatically included in requests
3. **Logout**: API call to logout → Clear local storage → Redirect

## 📊 Status Mapping

### Sales Status
- `Draft` → Frontend: `PRStatus.DRAFT`
- `Under Review` → Frontend: `PRStatus.UNDER_REVIEW`
- `Action Required` → Frontend: `PRStatus.ACTION_REQUIRED`
- `Approved` → Frontend: `PRStatus.APPROVED`
- `Rejected` → Frontend: `PRStatus.REJECTED`
- `Closed` → Frontend: `PRStatus.CLOSED`

### Analyst Status
- `Under Review` → Frontend: `AnalystStatus.UNDER_REVIEW`
- `Active Status` → Frontend: `AnalystStatus.ACTIVE_STATUS`
- `Closed` → Frontend: `AnalystStatus.CLOSED`

## 🧪 Testing

### Test Accounts
The application includes test accounts for development:

**Sales Executives:**
- john.smith@company.com / 123456
- michael.chen@company.com / 123456
- david.wilson@company.com / 123456

**Pricing Analysts:**
- sarah.analyst@company.com / 123456
- emily.rodriguez@company.com / 123456
- lisa.thompson@company.com / 123456

### API Testing
You can test the API integration by:

1. Setting up the backend with ngrok
2. Updating the API base URL
3. Running the frontend application
4. Using the test accounts to log in
5. Creating and managing pricing requests

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend allows requests from your frontend domain
2. **Authentication Failures**: Check that cookies are being sent with requests
3. **API Timeouts**: Verify the ngrok URL is accessible
4. **Data Format Issues**: Check the data transformation utilities

### Debug Mode
Enable debug logging by checking the browser console for:
- API request/response logs
- Error details
- Authentication state changes

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `https://your-ngrok-url.ngrok.io` |

## 🔄 Migration from Mock Data

The application has been migrated from mock data to real API calls:

- ✅ `AuthContext` now uses real authentication
- ✅ `SalesDashboard` uses real PR APIs
- ✅ `AnalystDashboard` uses real PR APIs
- ✅ All CRUD operations use real endpoints
- ✅ Error handling for network issues
- ✅ Loading states for better UX

## 📚 API Documentation

For detailed API documentation, refer to the backend API guide provided in the original documentation.

## 🎯 Next Steps

1. Set up your backend with ngrok
2. Update the API base URL
3. Test the authentication flow
4. Create and manage pricing requests
5. Test the approval workflow

The frontend is now fully integrated with the backend APIs and ready for production use! 