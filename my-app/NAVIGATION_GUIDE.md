# 🧭 Navigation Guide

## ✅ **Navigation Logic is Already Implemented**

Your application already has the correct navigation logic implemented. Here's how it works:

## 🔄 **How Navigation Works**

### **After Login/Signup:**

1. **User logs in or signs up** → AuthContext sets user data
2. **User data is saved** to localStorage
3. **NavigationHelper detects user** and redirects based on role
4. **DashboardRoute handles routing** to appropriate dashboard

### **Role-Based Navigation:**

| User Role | Redirects To | Dashboard |
|-----------|-------------|-----------|
| **Sales Executive** | `/sales` | Sales Dashboard |
| **Pricing Analyst** | `/analyst` | Analyst Dashboard |

## 🛠️ **Navigation Components**

### **1. DashboardRoute (App.tsx)**
```typescript
// Redirects based on user role
if (user.role === UserRole.SALES_EXECUTIVE) {
  return <Navigate to="/sales" replace />;
} else if (user.role === UserRole.PRICING_ANALYST) {
  return <Navigate to="/analyst" replace />;
}
```

### **2. NavigationHelper (NavigationHelper.tsx)**
```typescript
// Handles navigation when user state changes
if (user.role === UserRole.SALES_EXECUTIVE) {
  navigate('/sales');
} else if (user.role === UserRole.PRICING_ANALYST) {
  navigate('/analyst');
}
```

### **3. AuthContext (AuthContext.tsx)**
```typescript
// Sets user role after successful login/signup
const user: User = {
  id: response.user_id || Date.now().toString(),
  name: response.name || email.split('@')[0],
  email: email,
  role: response.role === 'SE' ? UserRole.SALES_EXECUTIVE : UserRole.PRICING_ANALYST,
  createdAt: new Date()
};
```

## 🧪 **Testing the Navigation**

### **Test Login Flow:**

1. **Go to `/test`** - Test login page
2. **Click "Login as John Smith"** (Sales Executive)
3. **Should redirect to `/sales`** - Sales Dashboard

### **Test Signup Flow:**

1. **Go to `/auth`** - Auth page
2. **Click "Sign Up"**
3. **Fill form with Sales Executive role**
4. **Should redirect to `/sales`** - Sales Dashboard

### **Test Analyst Flow:**

1. **Go to `/auth`** - Auth page
2. **Click "Sign Up"**
3. **Fill form with Pricing Analyst role**
4. **Should redirect to `/analyst`** - Analyst Dashboard

## 🔍 **Debugging Navigation**

### **Check Browser Console:**

Look for these log messages:
```
AuthProvider - login successful, setting user: {name: "John", role: "SALES_EXECUTIVE"}
DashboardRoute - redirecting to /sales
NavigationHelper - navigating to /sales
```

### **Check Current Route:**

1. **Open browser dev tools** (F12)
2. **Go to Console tab**
3. **Type**: `window.location.pathname`
4. **Should show**: `/sales` or `/analyst`

## 🚨 **Common Issues & Solutions**

### **Issue 1: Not Redirecting**
**Cause**: User role not set correctly
**Solution**: Check browser console for user data

### **Issue 2: Wrong Dashboard**
**Cause**: Role mapping incorrect
**Solution**: Verify role is 'SE' or 'PA' from API

### **Issue 3: Stuck on Loading**
**Cause**: API call failing
**Solution**: Check network tab for API errors

## 📋 **Expected Behavior**

### **Sales Executive:**
- ✅ Login → `/sales` dashboard
- ✅ Signup → `/sales` dashboard
- ✅ Access to create/edit PRs
- ✅ View sales-specific data

### **Pricing Analyst:**
- ✅ Login → `/analyst` dashboard
- ✅ Signup → `/analyst` dashboard
- ✅ Access to review/approve PRs
- ✅ View analyst-specific data

## 🎯 **Verification Steps**

1. **Test with Sales Executive:**
   - Login: `john.smith@company.com` / `123456`
   - Should redirect to `/sales`

2. **Test with Pricing Analyst:**
   - Login: `sarah.analyst@company.com` / `123456`
   - Should redirect to `/analyst`

3. **Test Signup:**
   - Create new account with either role
   - Should redirect to appropriate dashboard

The navigation is already working correctly! 🚀 