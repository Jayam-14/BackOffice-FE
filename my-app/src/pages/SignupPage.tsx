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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  TableChart as TableChartIcon,
  Person as PersonIcon,
  MailOutline as MailOutlineIcon,
  PersonAdd as PersonAddIcon,
  LocalShipping as LocalShippingIcon,
  Lock as LockIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { SelectChangeEvent } from '@mui/material/Select';

export const SignupPage: React.FC = () => {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    role: "SE" as "SE" | "PA",
  });

  const handleRegisterChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!registerData.username || !registerData.email || !registerData.password) {
      setError("Please fill in all fields");
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
        registerData.role
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BusinessIcon sx={{ fontSize: 48, color: 'white', mr: 2 }} />
            <Typography variant="h3" fontWeight="bold">
              Welcome to
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
              <TableChartIcon sx={{ mr: 2, fontSize: 24, color: '#90caf9' }} />
              <Typography variant="body1" sx={{ color: '#90caf9' }}>Track shipments in real time</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 2, fontSize: 24, color: '#90caf9' }} />
              <Typography variant="body1" sx={{ color: '#90caf9' }}>Role-based secure access</Typography>
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
          <Paper elevation={16} sx={{ width: 700, maxWidth: '90vw', p: 5, borderRadius: 4, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            {/* No logo in the card */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <PersonAddIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Create Account
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Join our professional logistics platform
              </Typography>
            </Box>
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
                InputProps={{
                  startAdornment: <PersonIcon sx={{ color: 'primary.main', mr: 1 }} />,
                }}
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
                InputProps={{
                  startAdornment: <MailOutlineIcon sx={{ color: 'primary.main', mr: 1 }} />,
                }}
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
                InputProps={{
                  startAdornment: <LockIcon sx={{ color: 'primary.main', mr: 1 }} />,
                }}
              />
              <FormControl fullWidth margin="normal" required sx={{ mb: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={registerData.role}
                  label="Role"
                  onChange={handleRoleChange}
                  disabled={isLoading}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="SE">Sales Executive</MenuItem>
                  <MenuItem value="PA">Pricing Analyst</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2, fontSize: '1.1rem', fontWeight: 600, textTransform: 'none', background: '#1976d2' }}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Box>
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Already have an account?{' '}
              <span style={{ color: '#1976d2', cursor: 'pointer' }} onClick={() => navigate('/login')}>
                Sign in here
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