import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Container,
  Chip,
  Fade,
  Slide,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
  };

  const handleProfile = () => {
    // Navigate to profile or show profile info
    handleClose();
  };

  const getRoleDisplayName = (role: string) => {
    return role === "SE" ? "Sales Executive" : "Pricing Analyst";
  };

  const getRoleColor = (role: string) => {
    return role === "SE" ? "success" : "info";
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
              <BusinessIcon sx={{ fontSize: 32, mr: 2, color: "white" }} />
              <Typography
                variant="h5"
                component="div"
                sx={{
                  flexGrow: 1,
                  fontWeight: 700,
                  color: "white",
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                BackOffice
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                label={getRoleDisplayName(user?.role || "")}
                color={getRoleColor(user?.role || "") as any}
                size="small"
                sx={{
                  color: "white",
                  fontWeight: 600,
                  "& .MuiChip-label": {
                    color: "white",
                  },
                }}
              />

              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontWeight: 500,
                  display: { xs: "none", sm: "block" },
                }}
              >
                {user?.name}
              </Typography>

              <IconButton
                size="large"
                aria-label="notifications"
                sx={{ color: "white" }}
              >
                <NotificationsIcon />
              </IconButton>

              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                sx={{
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <PersonIcon />
                </Avatar>
              </IconButton>

              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    borderRadius: 2,
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                  },
                }}
              >
                <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
                  <PersonIcon sx={{ mr: 2, color: "primary.main" }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                  <SettingsIcon sx={{ mr: 2, color: "text.secondary" }} />
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={handleLogout}
                  sx={{ py: 1.5, color: "error.main" }}
                >
                  <LogoutIcon sx={{ mr: 2 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: "grey.50" }}>
        <Slide direction="up" in={true} timeout={600}>
          <Box sx={{ minHeight: "calc(100vh - 64px)" }}>{children}</Box>
        </Slide>
      </Box>
    </Box>
  );
};
