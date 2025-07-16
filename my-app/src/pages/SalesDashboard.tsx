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
  Dialog,
  DialogTitle,
  DialogContent,
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
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { salesPRService } from "../services/prService";
import { PRStatus } from "../types";
import { PRForm } from "../component/PRForm";
import type { PR, PRCreateData } from "../types";
import CloseIcon from '@mui/icons-material/Close';

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

const getStatusColor = (status: string, pr?: PR) => {
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
      // For closed status, check if it was approved or rejected
      if (pr) {
        // First check the finalApprovalStatus field
        if (pr.finalApprovalStatus?.toLowerCase() === PRStatus.APPROVED.toLowerCase()) {
          return "success"; // Green for approved closed PRs
        } else if (pr.finalApprovalStatus?.toLowerCase() === PRStatus.REJECTED.toLowerCase()) {
          return "error"; // Red for rejected closed PRs
        }
        // Fallback: Check if the analyst status shows it was approved or rejected
        if (pr.analystStatus?.toLowerCase() === PRStatus.APPROVED.toLowerCase()) {
          return "success"; // Green for approved closed PRs
        } else if (pr.analystStatus?.toLowerCase() === PRStatus.REJECTED.toLowerCase()) {
          return "error"; // Red for rejected closed PRs
        }
        // Last resort: Check comments for approval/rejection indicators
        if (pr.comments && pr.comments.length > 0) {
          const lastComment = pr.comments[pr.comments.length - 1];
          if (lastComment.commentText?.toLowerCase().includes('approved')) {
            return "success"; // Green for approved closed PRs
          } else if (lastComment.commentText?.toLowerCase().includes('rejected')) {
            return "error"; // Red for rejected closed PRs
          }
        }
      }
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

export const SalesDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  console.log("SalesDashboard - User:", user);

  const {
    data: prs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sales-prs", user?.id],
    queryFn: async () => {
      console.log("SalesDashboard - Fetching Sales PRs...");
      try {
        const result = await salesPRService.getPRs();
        console.log("SalesDashboard - Sales PRs fetched successfully:", result);
        return result;
      } catch (err) {
        console.error("SalesDashboard - Error fetching PRs:", err);
        throw err;
      }
    },
    enabled: !!user,
    refetchInterval: 10000, // Refetch every 10 seconds
    refetchIntervalInBackground: true, // Continue refetching even when tab is not active
  });

  const createMutation = useMutation({
    mutationFn: (data: PRCreateData) => salesPRService.createPR(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["sales-prs"] });
      const previousPRs = queryClient.getQueryData(["sales-prs"]);
      
      // Optimistically add the new PR
      if (previousPRs) {
        const newPR = {
          id: `temp-${Date.now()}`,
          ...data,
          salesStatus: "Draft",
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData(["sales-prs"], [...previousPRs, newPR]);
      }
      
      return { previousPRs };
    },
    onError: (err, variables, context) => {
      if (context?.previousPRs) {
        queryClient.setQueryData(["sales-prs"], context.previousPRs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-prs"] });
      setIsCreateDialogOpen(false);
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: PRCreateData) => salesPRService.submitPR(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["sales-prs"] });
      const previousPRs = queryClient.getQueryData(["sales-prs"]);
      
      // Optimistically add the new PR
      if (previousPRs) {
        const newPR = {
          id: `temp-${Date.now()}`,
          ...data,
          salesStatus: "Under Review",
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData(["sales-prs"], [...previousPRs, newPR]);
      }
      
      return { previousPRs };
    },
    onError: (err, variables, context) => {
      if (context?.previousPRs) {
        queryClient.setQueryData(["sales-prs"], context.previousPRs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-prs"] });
      setIsCreateDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (prId: string) => salesPRService.deletePR(prId),
    onMutate: async (prId) => {
      await queryClient.cancelQueries({ queryKey: ["sales-prs"] });
      const previousPRs = queryClient.getQueryData(["sales-prs"]);
      
      // Optimistically remove the PR
      if (previousPRs) {
        queryClient.setQueryData(["sales-prs"], 
          previousPRs.filter((pr: PR) => pr.id !== prId)
        );
      }
      
      return { previousPRs };
    },
    onError: (err, variables, context) => {
      if (context?.previousPRs) {
        queryClient.setQueryData(["sales-prs"], context.previousPRs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-prs"] });
    },
  });

  const handleCreatePR = () => {
    setIsCreateDialogOpen(true);
  };

  const handleViewPR = (prId: string) => {
    navigate(`/pr/${prId}`);
  };

  const handleEditPR = (prId: string) => {
    navigate(`/pr/${prId}`);
  };

  const handleDeletePR = (prId: string) => {
    if (window.confirm("Are you sure you want to delete this PR?")) {
      deleteMutation.mutate(prId);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filterPRsByStatus = (status: string) => {
    return (
      prs?.filter(
        (pr) =>
          pr.salesStatus?.toLowerCase() === status.toLowerCase() ||
          pr.salesStatus?.toLowerCase() ===
            status.toLowerCase().replace("_", " ")
      ) || []
    );
  };

  const getStats = () => {
    if (!prs)
      return {
        total: 0,
        drafts: 0,
        underReview: 0,
        approved: 0,
        rejected: 0,
        actionRequired: 0,
      };

    return {
      total: prs.length,
      drafts: filterPRsByStatus(PRStatus.DRAFT).length,
      underReview: filterPRsByStatus(PRStatus.UNDER_REVIEW).length,
      approved: filterPRsByStatus(PRStatus.APPROVED).length,
      rejected: filterPRsByStatus(PRStatus.REJECTED).length,
      actionRequired: filterPRsByStatus(PRStatus.ACTION_REQUIRED).length,
    };
  };

  const stats = getStats();

  if (isLoading) {
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

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">Failed to load PRs</Alert>
      </Container>
    );
  }

  const renderPRCard = (pr: PR) => (
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
                label={getStatusLabel(pr.salesStatus)}
                color={getStatusColor(pr.salesStatus, pr) as any}
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

              {(pr.salesStatus?.toLowerCase() ===
                PRStatus.DRAFT.toLowerCase() ||
                pr.salesStatus?.toLowerCase() === "draft") && (
                <>
                  <IconButton
                    size="small"
                    onClick={() => handleEditPR(pr.id)}
                    color="primary"
                    sx={{
                      bgcolor: "info.main",
                      color: "white",
                      "&:hover": { bgcolor: "info.dark" },
                    }}
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={() => handleDeletePR(pr.id)}
                    color="error"
                    disabled={deleteMutation.isPending}
                    sx={{
                      bgcolor: "error.main",
                      color: "white",
                      "&:hover": { bgcolor: "error.dark" },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
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
              Sales Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Manage your pricing requests and track their progress
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: "center", borderRadius: 3 }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total PRs
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
                  {stats.drafts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Drafts
                </Typography>
              </Paper>
            </Grid>
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
                  {stats.underReview}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Under Review
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
                  {stats.approved}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  borderRadius: 3,
                  bgcolor: "error.light",
                }}
              >
                <Typography variant="h4" color="error.dark" fontWeight="bold">
                  {stats.rejected}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rejected
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  borderRadius: 3,
                  bgcolor: "orange.light",
                }}
              >
                <Typography variant="h4" color="orange.dark" fontWeight="bold">
                  {stats.actionRequired}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Action Required
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Action Button */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" component="h2" fontWeight="bold">
              Pricing Requests
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreatePR}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                },
              }}
            >
              Create PR
            </Button>
          </Box>

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
              <Tab label="All" />
              <Tab label="Drafts" />
              <Tab label="Under Review" />
              <Tab label="Action Required" />
              <Tab label="Approved" />
              <Tab label="Rejected" />
            </Tabs>
          </Paper>

          {/* PR List */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {prs?.map(renderPRCard)}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {filterPRsByStatus(PRStatus.DRAFT).map(renderPRCard)}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              {filterPRsByStatus(PRStatus.UNDER_REVIEW).map(renderPRCard)}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              {filterPRsByStatus(PRStatus.ACTION_REQUIRED).map(renderPRCard)}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={3}>
              {filterPRsByStatus(PRStatus.APPROVED).map(renderPRCard)}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <Grid container spacing={3}>
              {filterPRsByStatus(PRStatus.REJECTED).map(renderPRCard)}
            </Grid>
          </TabPanel>
        </Box>
      </Slide>

      {/* Create PR Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2, position: 'relative' }}>
          Create New Pricing Request
          <IconButton
            aria-label="close"
            onClick={() => setIsCreateDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Save as Draft" />
              <Tab label="Submit for Review" />
            </Tabs>
          </Box>
          <PRForm
            onSubmit={(data) => {
              if (tabValue === 0) {
                createMutation.mutate(data);
              } else {
                submitMutation.mutate(data);
              }
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createMutation.isPending || submitMutation.isPending}
            submitLabel={tabValue === 0 ? "Save as Draft" : "Submit for Review"}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};
