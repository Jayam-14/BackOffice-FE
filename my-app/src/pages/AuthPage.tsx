import React, { useState } from "react";
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
  Grid,
  Container,
  Fade,
  Slide,
} from "@mui/material";
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  AccountCircle as AccountIcon,
  TableChart as TableChartIcon,
  PersonAdd as PersonAddIcon,
  MailOutline as MailOutlineIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types";
import type { SelectChangeEvent } from '@mui/material/Select';

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
      {value === index && (
        <Fade in={value === index} timeout={500}>
          <Box sx={{ py: 4 }}>{children}</Box>
        </Fade>
      )}
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
    email: "",
    password: "",
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "SE" as "SE" | "PA",
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleLoginChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setLoginData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleRegisterChange =
    (field: string) =>
    (event: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
      setRegisterData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setRegisterData((prev) => ({
      ...prev,
      role: event.target.value as 'SE' | 'PA',
    }));
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!loginData.email || !loginData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await login(loginData.email, loginData.password);
      setSuccess("Login successful! Redirecting...");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (
      !registerData.username ||
      !registerData.email ||
      !registerData.password ||
      !registerData.confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      await signup(
        registerData.username,
        registerData.email,
        registerData.password,
        registerData.role === "SE"
          ? UserRole.SALES_EXECUTIVE
          : UserRole.PRICING_ANALYST
      );
      setSuccess("Registration successful! Redirecting...");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed");
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        m: 0,
        p: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Grid container sx={{ minHeight: '100vh', width: '100vw', m: 0, p: 0, boxShadow: 'none', borderRadius: 0, maxWidth: 'none' }}>
        {/* Left Panel: Welcome Message & Features */}
        <Grid item xs={12} md={6} sx={{
          background: 'transparent',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          px: { xs: 4, md: 8 },
          py: { xs: 6, md: 0 },
          minHeight: '100vh',
        }}>
          <Typography variant="h3" fontWeight="bold" sx={{ mb: 2 }}>
            Welcome to
          </Typography>
          <Typography variant="h3" fontWeight="bold" sx={{ mb: 2 }}>
            Pricing Request System
          </Typography>
          <Typography variant="h6" fontWeight="medium" sx={{ mb: 3, color: 'rgba(255,255,255,0.85)' }}>
            Streamline your pricing requests and approvals<br />with our professional platform.
          </Typography>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TableChartIcon sx={{ mr: 2, fontSize: 24, color: '#90caf9' }} />
              <Typography variant="body1" sx={{ color: '#90caf9' }}>Efficient pricing management</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 2, fontSize: 24, color: '#90caf9' }} />
              <Typography variant="body1" sx={{ color: '#90caf9' }}>Role-based access control</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MailOutlineIcon sx={{ mr: 2, fontSize: 24, color: '#90caf9' }} />
              <Typography variant="body1" sx={{ color: '#90caf9' }}>Real-time collaboration</Typography>
            </Box>
          </Box>
        </Grid>
        {/* Right Panel: Create Account Card */}
        <Grid item xs={12} md={6} sx={{
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}>
          <Paper elevation={16} sx={{ width: 700, maxWidth: '90vw', p: 5, borderRadius: 4, background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <PersonAddIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Create Account
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Join our professional pricing platform
              </Typography>
            </Box>
            {/* Tabs for Sign In / Sign Up */}
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              sx={{ mb: 3, display: 'none' }} // Hide tabs for this view
            >
              <Tab label="Sign In" />
              <Tab label="Sign Up" />
            </Tabs>
            {/* Sign Up Form */}
            <TabPanel value={tabValue} index={1}>
              <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Full Name *"
                  value={registerData.username}
                  onChange={handleRegisterChange('username')}
                  margin="normal"
                  required
                  disabled={isLoading}
                  sx={{ borderRadius: 2, mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Email Address *"
                  type="email"
                  value={registerData.email}
                  onChange={handleRegisterChange('email')}
                  margin="normal"
                  required
                  disabled={isLoading}
                  sx={{ borderRadius: 2, mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Password *"
                  type="password"
                  value={registerData.password}
                  onChange={handleRegisterChange('password')}
                  margin="normal"
                  required
                  disabled={isLoading}
                  sx={{ borderRadius: 2, mb: 2 }}
                />
                <FormControl fullWidth margin="normal" required sx={{ mb: 2 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={registerData.role}
                    label="Role"
                    onChange={handleRoleChange}
                    disabled={isLoading}
                  >
                    <MenuItem value="SE">Sales Executive</MenuItem>
                    <MenuItem value="PA">Pricing Analyst</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2, fontSize: '1.1rem', fontWeight: 600, textTransform: 'none' }}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Box>
              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Already have an account?{' '}
                <span style={{ color: '#1976d2', cursor: 'pointer' }} onClick={() => setTabValue(0)}>
                  Sign in here
                </span>
              </Typography>
            </TabPanel>
            {/* Error/Success Alerts */}
            {error && (
              <Fade in={!!error}>
                <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}
            {success && (
              <Fade in={!!success}>
                <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                  {success}
                </Alert>
              </Fade>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
