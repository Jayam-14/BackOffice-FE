import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Container,
  Paper,
  Fade,
  Slide,
  Stack,
  Divider,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Comment as CommentIcon,
  Person as AssignIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { paPRService } from "../services/prService";
import { PRStatus, UserRole } from "../types";
import type { PR } from "../types";

// Safe date formatting function
const safeFormatDate = (date: any, formatString: string): string => {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }
    return format(dateObj, formatString);
  } catch (error) {
    return "Invalid Date";
  }
};

const getStatusColor = (status: string) => {
  const normalizedStatus = status?.toLowerCase();
  switch (normalizedStatus) {
    case PRStatus.DRAFT.toLowerCase():
      return "default";
    case PRStatus.UNDER_REVIEW.toLowerCase():
      return "warning";
    case PRStatus.ACTION_REQUIRED.toLowerCase():
      return "error";
    case PRStatus.APPROVED.toLowerCase():
      return "success";
    case PRStatus.REJECTED.toLowerCase():
      return "error";
    case PRStatus.ACTIVE_STATUS.toLowerCase():
    case "active status":
      return "info";
    case PRStatus.CLOSED.toLowerCase():
    case "closed":
      return "default";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string) => {
  const normalizedStatus = status?.toLowerCase();
  switch (normalizedStatus) {
    case PRStatus.DRAFT.toLowerCase():
      return "Draft";
    case PRStatus.UNDER_REVIEW.toLowerCase():
      return "Under Review";
    case PRStatus.ACTION_REQUIRED.toLowerCase():
      return "Action Required";
    case PRStatus.APPROVED.toLowerCase():
      return "Approved";
    case PRStatus.REJECTED.toLowerCase():
      return "Rejected";
    case PRStatus.ACTIVE_STATUS.toLowerCase():
    case "active status":
      return "Active Status";
    case PRStatus.CLOSED.toLowerCase():
    case "closed":
      return "Closed";
    default:
      return status;
  }
};

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={value === index} timeout={500}>
          <Box sx={{ py: 3 }}>{children}</Box>
        </Fade>
      )}
    </div>
  );
}

export const AnalystDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);

  console.log("AnalystDashboard - User:", user);
  console.log("AnalystDashboard - User role:", user?.role);

  const {
    data: availablePRs,
    isLoading: isLoadingAvailable,
    error: errorAvailable,
  } = useQuery({
    queryKey: ["pa-available-prs", user?.id],
    queryFn: async () => {
      console.log("AnalystDashboard - Fetching available PRs...");
      try {
        const result = await paPRService.getAvailablePRs();
        console.log(
          "AnalystDashboard - Available PRs fetched successfully:",
          result
        );
        return result;
      } catch (err) {
        console.error("AnalystDashboard - Error fetching available PRs:", err);
        throw err;
      }
    },
    enabled: !!user,
  });

  const {
    data: myPRs,
    isLoading: isLoadingMy,
    error: errorMy,
  } = useQuery({
    queryKey: ["pa-my-prs", user?.id],
    queryFn: async () => {
      console.log("AnalystDashboard - Fetching my assigned PRs...");
      try {
        const result = await paPRService.getMyAssignedPRs();
        console.log("AnalystDashboard - My PRs fetched successfully:", result);
        return result;
      } catch (err) {
        console.error("AnalystDashboard - Error fetching my PRs:", err);
        throw err;
      }
    },
    enabled: !!user,
  });

  const assignMutation = useMutation({
    mutationFn: (prId: string) => paPRService.assignPR(prId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pa-available-prs"] });
      queryClient.invalidateQueries({ queryKey: ["pa-my-prs"] });
    },
  });

  const handleViewPR = (prId: string) => {
    navigate(`/pr/${prId}`);
  };

  const handleAssignPR = (prId: string) => {
    if (window.confirm("Assign this pricing request to yourself?")) {
      assignMutation.mutate(prId);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filterPRsByStatus = (prs: PR[], status: string) => {
    return (
      prs?.filter(
        (pr) =>
          pr.analystStatus?.toLowerCase() === status.toLowerCase() ||
          pr.analystStatus?.toLowerCase() ===
            status.toLowerCase().replace("_", " ")
      ) || []
    );
  };

  const getStats = () => {
    return {
      available: availablePRs?.length || 0,
      assigned: myPRs?.length || 0,
      activeStatus: filterPRsByStatus(myPRs || [], PRStatus.ACTIVE_STATUS)
        .length,
      closed: filterPRsByStatus(myPRs || [], PRStatus.CLOSED).length,
    };
  };

  const stats = getStats();

  if (isLoadingAvailable || isLoadingMy) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (errorAvailable || errorMy) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">Failed to load PRs</Alert>
      </Container>
    );
  }

  const renderPRCard = (pr: PR, showAssignButton = false) => (
    <Grid item xs={12} md={6} lg={4} key={pr.id}>
      <Slide direction="up" in={true} timeout={600}>
        <Card
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            },
          }}
        >
          <CardContent sx={{ flexGrow: 1, p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              <Typography variant="h6" component="h2" noWrap fontWeight="bold">
                {pr.accountInfo}
              </Typography>
              <Chip
                label={getStatusLabel(pr.analystStatus || pr.salesStatus)}
                color={
                  getStatusColor(pr.analystStatus || pr.salesStatus) as any
                }
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ScheduleIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {safeFormatDate(pr.shipmentDate, "MMM dd, yyyy")}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BusinessIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  From: {pr.originAddress ? `${pr.originAddress}, ` : ""}
                  {pr.originState || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TrendingUpIcon
                  sx={{ fontSize: 16, color: "text.secondary" }}
                />
                <Typography variant="body2" color="text.secondary">
                  To: {pr.destAddress ? `${pr.destAddress}, ` : ""}
                  {pr.destState || "N/A"}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <IconButton
                size="small"
                onClick={() => handleViewPR(pr.id)}
                color="primary"
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                <ViewIcon />
              </IconButton>

              {showAssignButton && !pr.assignedTo && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleAssignPR(pr.id)}
                  color="success"
                  disabled={assignMutation.isPending}
                  startIcon={<AssignIcon />}
                  sx={{
                    fontSize: "0.75rem",
                    borderRadius: 2,
                    "&:hover": {
                      bgcolor: "success.main",
                      color: "white",
                    },
                  }}
                >
                  Assign
                </Button>
              )}

              {(pr.analystStatus?.toLowerCase() ===
                PRStatus.ACTIVE_STATUS.toLowerCase() ||
                pr.analystStatus?.toLowerCase() === "active status") && (
                <>
                  <IconButton
                    size="small"
                    onClick={() => handleViewPR(pr.id)}
                    color="success"
                    sx={{
                      bgcolor: "success.main",
                      color: "white",
                      "&:hover": { bgcolor: "success.dark" },
                    }}
                  >
                    <ApproveIcon />
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={() => handleViewPR(pr.id)}
                    color="error"
                    sx={{
                      bgcolor: "error.main",
                      color: "white",
                      "&:hover": { bgcolor: "error.dark" },
                    }}
                  >
                    <RejectIcon />
                  </IconButton>
                </>
              )}

              {(pr.analystStatus?.toLowerCase() ===
                PRStatus.ACTION_REQUIRED.toLowerCase() ||
                pr.analystStatus?.toLowerCase() === "action required") && (
                <IconButton
                  size="small"
                  onClick={() => handleViewPR(pr.id)}
                  color="warning"
                  sx={{
                    bgcolor: "warning.main",
                    color: "white",
                    "&:hover": { bgcolor: "warning.dark" },
                  }}
                >
                  <CommentIcon />
                </IconButton>
              )}
            </Box>
          </CardContent>
        </Card>
      </Slide>
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Slide direction="up" in={true} timeout={800}>
        <Box>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              fontWeight="bold"
              color="primary"
            >
              Pricing Analyst Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Review and approve pricing requests from sales executives
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  borderRadius: 3,
                  bgcolor: "info.light",
                }}
              >
                <Typography variant="h4" color="info.dark" fontWeight="bold">
                  {stats.available}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available PRs
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  borderRadius: 3,
                  bgcolor: "primary.light",
                }}
              >
                <Typography variant="h4" color="primary.dark" fontWeight="bold">
                  {stats.assigned}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  My Assigned PRs
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  borderRadius: 3,
                  bgcolor: "warning.light",
                }}
              >
                <Typography variant="h4" color="warning.dark" fontWeight="bold">
                  {stats.activeStatus}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Status
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  borderRadius: 3,
                  bgcolor: "success.light",
                }}
              >
                <Typography variant="h4" color="success.dark" fontWeight="bold">
                  {stats.closed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Closed
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                bgcolor: "grey.50",
                "& .MuiTab-root": {
                  fontSize: "1rem",
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
              <Tab label="Available PRs" />
              <Tab label="My Assigned PRs" />
            </Tabs>
          </Paper>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Available Pricing Requests
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Click the "Assign" button to take ownership of unassigned
                pricing requests for review
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {availablePRs?.map((pr) => renderPRCard(pr, true))}
            </Grid>

            {availablePRs?.length === 0 && (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <AssignmentIcon
                  sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  No available pricing requests
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  All pricing requests have been assigned or processed
                </Typography>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                My Assigned Pricing Requests
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Pricing requests assigned to you for review and approval
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {myPRs?.map((pr) => renderPRCard(pr, false))}
            </Grid>

            {myPRs?.length === 0 && (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <AssignmentIcon
                  sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  No assigned pricing requests
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Assign pricing requests from the Available PRs tab to get
                  started
                </Typography>
              </Box>
            )}
          </TabPanel>
        </Box>
      </Slide>
    </Container>
  );
};
