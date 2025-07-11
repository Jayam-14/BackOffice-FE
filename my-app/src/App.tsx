import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Typography, Button, Paper } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationHelper } from './components/NavigationHelper';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthPage } from './pages/AuthPage';
import { SalesDashboard } from './pages/SalesDashboard';
import { AnalystDashboard } from './pages/AnalystDashboard';
import { UserRole } from './types';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Component to track route changes
const RouteTracker: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    console.log('Route changed to:', location.pathname);
  }, [location]);
  
  return null;
};

// Test component to manually test login
const TestLogin: React.FC = () => {
  const { user, login, signup, logout } = useAuth();
  
  const testAccounts = [
    { name: 'John Smith (Sales)', email: 'john.smith@company.com', password: '123456' },
    { name: 'Sarah Johnson (Analyst)', email: 'sarah.analyst@company.com', password: '123456' },
    { name: 'Michael Chen (Sales)', email: 'michael.chen@company.com', password: '123456' },
    { name: 'Emily Rodriguez (Analyst)', email: 'emily.rodriguez@company.com', password: '123456' },
    { name: 'David Wilson (Sales)', email: 'david.wilson@company.com', password: '123456' },
    { name: 'Lisa Thompson (Analyst)', email: 'lisa.thompson@company.com', password: '123456' }
  ];
  
  const handleTestLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      console.log('Test login completed for:', email);
    } catch (error) {
      console.error('Test login failed:', error);
    }
  };
  
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Test Login Page
      </Typography>
      <Typography variant="body1" gutterBottom>
        Current user: {user ? `${user.name} (${user.role})` : 'None'}
      </Typography>
      
      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Available Test Accounts:
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
          {testAccounts.map((account, index) => (
            <Paper key={index} sx={{ p: 2, border: '1px solid #ddd' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {account.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {account.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Password: {account.password}
              </Typography>
              <Button 
                onClick={() => handleTestLogin(account.email, account.password)}
                variant="contained" 
                size="small"
                sx={{ mt: 1 }}
              >
                Login as {account.name.split(' ')[0]}
              </Button>
            </Paper>
          ))}
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button onClick={logout} variant="outlined" color="error">
          Logout
        </Button>
      </Box>
    </Box>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  console.log('ProtectedRoute - user:', user, 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - no user, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('ProtectedRoute - user authenticated, showing children');
  return <>{children}</>;
};

const DashboardRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  console.log('DashboardRoute - user:', user, 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!user) {
    console.log('DashboardRoute - no user, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Redirect based on user role
  if (user.role === UserRole.SALES_EXECUTIVE) {
    console.log('DashboardRoute - redirecting to /sales');
    return <Navigate to="/sales" replace />;
  } else if (user.role === UserRole.PRICING_ANALYST) {
    console.log('DashboardRoute - redirecting to /analyst');
    return <Navigate to="/analyst" replace />;
  }

  console.log('DashboardRoute - unknown role, redirecting to /auth');
  return <Navigate to="/auth" replace />;
};

// AppRoutes component that uses navigation hooks
const AppRoutes: React.FC = () => {
  return (
    <>
      <RouteTracker />
      <NavigationHelper />
      <Routes>
        <Route path="/test" element={<TestLogin />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <SalesDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analyst"
          element={
            <ProtectedRoute>
              <AnalystDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<DashboardRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
