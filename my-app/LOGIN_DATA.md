# Login Test Data

This document contains all the test login credentials for the BackOffice Frontend application.

## Test Accounts

### Sales Executives

| Name | Email | Password | Region | Department |
|------|-------|----------|--------|------------|
| John Smith | john.smith@company.com | 123456 | North America | Sales |
| Michael Chen | michael.chen@company.com | 123456 | Asia Pacific | Sales |
| David Wilson | david.wilson@company.com | 123456 | Europe | Sales |

### Pricing Analysts

| Name | Email | Password | Region | Department |
|------|-------|----------|--------|------------|
| Sarah Johnson | sarah.analyst@company.com | 123456 | Global | Pricing |
| Emily Rodriguez | emily.rodriguez@company.com | 123456 | Europe | Pricing |
| Lisa Thompson | lisa.thompson@company.com | 123456 | North America | Pricing |

## How to Use

### Method 1: Test Login Page
1. Navigate to `/test` in your browser
2. You'll see all available test accounts displayed
3. Click on any "Login as [Name]" button to automatically log in with that account

### Method 2: Manual Login
1. Navigate to `/auth` or the main login page
2. Enter any of the email/password combinations above
3. The system will automatically redirect you to the appropriate dashboard based on your role

### Method 3: Signup New Account
1. Navigate to `/auth` and click "Don't have an account? Sign Up"
2. Fill in your details and select your role (Sales Executive or Pricing Analyst)
3. Click "Create Account"
4. You'll be automatically redirected to your role-specific dashboard

### Method 4: Direct URL Access
- Sales Executives will be redirected to `/sales` dashboard
- Pricing Analysts will be redirected to `/analyst` dashboard

## Role-Based Access

### Sales Executives
- Can view and manage pricing requests
- Can create new pricing requests
- Access to sales dashboard with request management features
- **Dashboard**: `/sales`

### Pricing Analysts
- Can review and approve pricing requests
- Can analyze pricing data
- Access to analyst dashboard with advanced analytics
- **Dashboard**: `/analyst`

## Authentication Features

- **Session Persistence**: Login state is saved in localStorage
- **Auto-redirect**: Users are automatically redirected to appropriate dashboards
- **Role-based Routing**: Different dashboards based on user role
- **Mock Authentication**: Simulated API calls with 1-second delay
- **Enhanced Signup**: Visual role selection with feature descriptions
- **Success Feedback**: Clear success messages during login/signup

## Signup Form Features

The enhanced signup form includes:

### Visual Role Selection
- **Sales Executive Card**: Shows features like "Create pricing requests", "Track shipments", "Manage customer data"
- **Pricing Analyst Card**: Shows features like "Review pricing requests", "Analyze market data", "Approve/deny requests"

### Form Validation
- Name must be at least 2 characters
- Valid email format required
- Password must be at least 6 characters
- Role selection is required

### User Experience
- Real-time form validation
- Success/error feedback messages
- Loading states during submission
- Automatic navigation to appropriate dashboard

## Testing Notes

- All passwords are set to `123456` for easy testing
- The system uses mock authentication (no real backend required)
- Login attempts are logged to the browser console
- Users can logout and switch between different test accounts
- New signup accounts are automatically added to the test user list
- Role-based navigation works for both existing and new accounts

## Development

To add new test users, edit the `TEST_USERS` array in `src/contexts/AuthContext.tsx`:

```typescript
const TEST_USERS = [
  {
    id: '7',
    name: 'New User',
    email: 'new.user@company.com',
    password: '123456',
    role: UserRole.SALES_EXECUTIVE, // or UserRole.PRICING_ANALYST
    department: 'Sales',
    region: 'North America'
  }
];
```

## Security Notes

⚠️ **Important**: This is a development/testing system with mock authentication. In production:
- Use strong, unique passwords
- Implement proper password hashing
- Add rate limiting for login attempts
- Use secure session management
- Implement proper user registration and validation
- Add email verification for new accounts
- Implement proper role-based access control (RBAC) 