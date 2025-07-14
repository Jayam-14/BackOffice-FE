import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Fade,
  Alert,
} from "@mui/material";
import {
  TableChart as TableChartIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  MailOutline as MailOutlineIcon,
  Login as LoginIcon,
  LocalShipping as LocalShippingIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleLoginChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setLoginData((prev) => ({
        ...prev,
        [field]: event.target.value,
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BusinessIcon sx={{ fontSize: 48, color: 'white', mr: 2 }} />
            <Typography variant="h3" fontWeight="bold">
              Welcome Back
            </Typography>
          </Box>
          <Typography variant="h3" fontWeight="bold" sx={{ mb: 2 }}>
            BackOffice Platform
          </Typography>
          <Typography variant="h6" fontWeight="medium" sx={{ mb: 3, color: 'rgba(255,255,255,0.85)' }}>
            Access your professional backoffice management platform.
          </Typography>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TableChartIcon sx={{ mr: 2, fontSize: 24, color: '#b3c6ff' }} />
              <Typography variant="body1" sx={{ color: '#b3c6ff' }}>Track shipments in real time</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 2, fontSize: 24, color: '#b3c6ff' }} />
              <Typography variant="body1" sx={{ color: '#b3c6ff' }}>Role-based secure access</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LockIcon sx={{ mr: 2, fontSize: 24, color: '#b3c6ff' }} />
              <Typography variant="body1" sx={{ color: '#b3c6ff' }}>Enterprise-grade security</Typography>
            </Box>
          </Box>
        </Grid>
        {/* Right Panel: Sign In Card */}
        <Grid item xs={12} md={6} sx={{
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}>
          <Paper elevation={16} sx={{ width: 600, maxWidth: '90vw', p: 5, borderRadius: 4, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            {/* No logo in the card */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Sign In
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Access your account
              </Typography>
            </Box>
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Email Address *"
                type="email"
                value={loginData.email}
                onChange={handleLoginChange('email')}
                margin="normal"
                required
                disabled={isLoading}
                sx={{ borderRadius: 2, mb: 2 }}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ color: 'primary.main', mr: 1 }} />,
                }}
              />
              <TextField
                fullWidth
                label="Password *"
                type="password"
                value={loginData.password}
                onChange={handleLoginChange('password')}
                margin="normal"
                required
                disabled={isLoading}
                sx={{ borderRadius: 2, mb: 1 }}
                InputProps={{
                  startAdornment: <LockIcon sx={{ color: 'primary.main', mr: 1 }} />,
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="text" size="small" sx={{ color: 'primary.main', textTransform: 'none' }}>
                  Forgot password?
                </Button>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 1, mb: 2, py: 1.5, borderRadius: 2, fontSize: '1.1rem', fontWeight: 600, textTransform: 'none', background: '#1976d2' }}
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Don't have an account?{' '}
              <span style={{ color: '#1976d2', cursor: 'pointer' }} onClick={() => navigate('/signup')}>
                Sign up here
              </span>
            </Typography>
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