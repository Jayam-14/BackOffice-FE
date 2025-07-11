import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const AuthPage: React.FC = () => {
  const { login, signup, isLoading } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'SE' as 'SE' | 'PA'
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleLoginChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleRegisterChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
    setRegisterData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(loginData.email, loginData.password);
      setSuccess('Login successful! Redirecting...');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!registerData.username || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await signup(
        registerData.username,
        registerData.email,
        registerData.password,
        registerData.role === 'SE' ? UserRole.SALES_EXECUTIVE : UserRole.PRICING_ANALYST
      );
      setSuccess('Registration successful! Redirecting...');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 500,
          p: 4,
          borderRadius: 2
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Backoffice Management System
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your account or create a new one
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={loginData.email}
              onChange={handleLoginChange('email')}
              margin="normal"
              required
              disabled={isLoading}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={loginData.password}
              onChange={handleLoginChange('password')}
              margin="normal"
              required
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box component="form" onSubmit={handleRegister} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  value={registerData.username}
                  onChange={handleRegisterChange('username')}
                  margin="normal"
                  required
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={registerData.email}
                  onChange={handleRegisterChange('email')}
                  margin="normal"
                  required
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={registerData.password}
                  onChange={handleRegisterChange('password')}
                  margin="normal"
                  required
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange('confirmPassword')}
                  margin="normal"
                  required
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={registerData.role}
                    label="Role"
                    onChange={handleRegisterChange('role')}
                    disabled={isLoading}
                  >
                    <MenuItem value="SE">Sales Executive</MenuItem>
                    <MenuItem value="PA">Pricing Analyst</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
          </Box>
        </TabPanel>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Demo Accounts:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Sales: john.smith@company.com / 123456
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analyst: sarah.analyst@company.com / 123456
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}; 