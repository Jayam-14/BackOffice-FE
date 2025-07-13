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
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types";

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
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
        },
      }}
    >
      <Container maxWidth="sm">
        <Slide direction="up" in={true} timeout={800}>
          <Paper
            elevation={24}
            sx={{
              width: "100%",
              p: 5,
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <BusinessIcon
                  sx={{ fontSize: 48, color: "primary.main", mr: 2 }}
                />
                <Typography
                  variant="h3"
                  component="h1"
                  gutterBottom
                  color="primary"
                  fontWeight="bold"
                >
                  BackOffice
                </Typography>
              </Box>
              <Typography
                variant="h6"
                component="h2"
                gutterBottom
                color="text.secondary"
                fontWeight="medium"
              >
                Management System
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Streamline your pricing request workflow
              </Typography>
            </Box>

            {error && (
              <Fade in={!!error}>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}

            {success && (
              <Fade in={!!success}>
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  {success}
                </Alert>
              </Fade>
            )}

            <Box sx={{ borderBottom: 2, borderColor: "primary.main", mb: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                centered
                sx={{
                  "& .MuiTab-root": {
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    textTransform: "none",
                    minHeight: 56,
                  },
                  "& .Mui-selected": {
                    color: "primary.main",
                  },
                  "& .MuiTabs-indicator": {
                    height: 3,
                    borderRadius: 1.5,
                  },
                }}
              >
                <Tab label="Sign In" icon={<LockIcon />} iconPosition="start" />
                <Tab
                  label="Create Account"
                  icon={<PersonIcon />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={loginData.email}
                  onChange={handleLoginChange("email")}
                  margin="normal"
                  required
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "primary.main",
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={loginData.password}
                  onChange={handleLoginChange("password")}
                  margin="normal"
                  required
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <LockIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "primary.main",
                      },
                    },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 4,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    textTransform: "none",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                    "&:hover": {
                      boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                    },
                  }}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box component="form" onSubmit={handleRegister} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={registerData.username}
                      onChange={handleRegisterChange("username")}
                      margin="normal"
                      required
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <AccountIcon
                            sx={{ mr: 1, color: "text.secondary" }}
                          />
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&:hover fieldset": {
                            borderColor: "primary.main",
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={registerData.email}
                      onChange={handleRegisterChange("email")}
                      margin="normal"
                      required
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&:hover fieldset": {
                            borderColor: "primary.main",
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      value={registerData.password}
                      onChange={handleRegisterChange("password")}
                      margin="normal"
                      required
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <LockIcon sx={{ mr: 1, color: "text.secondary" }} />
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&:hover fieldset": {
                            borderColor: "primary.main",
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange("confirmPassword")}
                      margin="normal"
                      required
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <LockIcon sx={{ mr: 1, color: "text.secondary" }} />
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&:hover fieldset": {
                            borderColor: "primary.main",
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel sx={{ borderRadius: 2 }}>Role</InputLabel>
                      <Select
                        value={registerData.role}
                        label="Role"
                        onChange={handleRegisterChange("role")}
                        disabled={isLoading}
                        sx={{
                          borderRadius: 2,
                          "& .MuiOutlinedInput-notchedOutline": {
                            "&:hover": {
                              borderColor: "primary.main",
                            },
                          },
                        }}
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
                  sx={{
                    mt: 4,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    textTransform: "none",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                    "&:hover": {
                      boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                    },
                  }}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </Box>
            </TabPanel>

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography
                variant="h6"
                color="text.secondary"
                gutterBottom
                fontWeight="medium"
              >
                Demo Accounts
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  justifyContent: "center",
                  mt: 2,
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "grey.50",
                    minWidth: 200,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="primary"
                    fontWeight="bold"
                  >
                    Sales Executive
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    john.smith@company.com
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Password: 123456
                  </Typography>
                </Paper>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "grey.50",
                    minWidth: 200,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="primary"
                    fontWeight="bold"
                  >
                    Pricing Analyst
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    sarah.analyst@company.com
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Password: 123456
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Paper>
        </Slide>
      </Container>
    </Box>
  );
};
