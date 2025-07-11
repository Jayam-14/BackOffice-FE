import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormData } from '../utils/validation';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import type { UserRoleType } from '../types';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRoleType | ''>('');
  const { signup, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  });

  const watchedRole = watch('role');

  const handleRoleSelect = (role: UserRoleType) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data: SignupFormData) => {
    console.log('Signup form submitted with data:', data);
    try {
      setError('');
      setSuccess('');
      console.log('Calling signup function...');
      await signup(data.name, data.email, data.password, data.role);
      setSuccess(`Welcome ${data.name}! You will be redirected to your dashboard shortly.`);
      console.log('Signup successful! User should be redirected automatically.');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  const roleDescriptions = {
    [UserRole.SALES_EXECUTIVE]: {
      title: 'Sales Executive',
      description: 'Create and manage pricing requests, track shipments, and handle customer inquiries.',
      features: ['Create pricing requests', 'Track shipments', 'Manage customer data', 'View pricing history']
    },
    [UserRole.PRICING_ANALYST]: {
      title: 'Pricing Analyst',
      description: 'Review pricing requests, analyze data, and provide pricing recommendations.',
      features: ['Review pricing requests', 'Analyze market data', 'Approve/deny requests', 'Generate reports']
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 600,
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Create Your Account
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Join our BackOffice system to manage pricing requests and shipments
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Full Name"
                  autoComplete="name"
                  autoFocus
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Email Address"
                  autoComplete="email"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Select Your Role
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Choose the role that best describes your responsibilities
                </Typography>
                
                <Grid container spacing={2}>
                  {Object.entries(roleDescriptions).map(([role, details]) => (
                    <Grid item xs={12} md={6} key={role}>
                      <Card 
                        variant={selectedRole === role ? "elevation" : "outlined"}
                        sx={{ 
                          cursor: 'pointer',
                          border: selectedRole === role ? '2px solid #1976d2' : '1px solid #ddd',
                          '&:hover': {
                            borderColor: '#1976d2',
                            boxShadow: 2
                          }
                        }}
                        onClick={() => handleRoleSelect(role as UserRoleType)}
                      >
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {details.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {details.description}
                          </Typography>
                          <Typography variant="body2" component="div">
                            <strong>Key Features:</strong>
                            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                              {details.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                              ))}
                            </ul>
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                
                {errors.role && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {errors.role.message}
                  </Typography>
                )}
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading || !selectedRole}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Link
                component="button"
                variant="body2"
                onClick={onSwitchToLogin}
                sx={{ cursor: 'pointer' }}
              >
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}; 