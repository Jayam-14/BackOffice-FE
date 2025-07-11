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
} from "@mui/material";
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Comment as CommentIcon,
  Person as AssignIcon,
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
  switch (status) {
    case PRStatus.DRAFT:
      return "default";
    case PRStatus.UNDER_REVIEW:
      return "warning";
    case PRStatus.ACTION_REQUIRED:
      return "error";
    case PRStatus.APPROVED:
      return "success";
    case PRStatus.REJECTED:
      return "error";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case PRStatus.DRAFT:
      return "Draft";
    case PRStatus.UNDER_REVIEW:
      return "Under Review";
    case PRStatus.ACTION_REQUIRED:
      return "Action Required";
    case PRStatus.APPROVED:
      return "Approved";
    case PRStatus.REJECTED:
      return "Rejected";
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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
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
    return prs?.filter((pr) => pr.analystStatus === status) || [];
  };

  if (isLoadingAvailable || isLoadingMy) {
    return (
      <Box sx={{ p: 3 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (errorAvailable || errorMy) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load PRs</Alert>
      </Box>
    );
  }

  const renderPRCard = (pr: PR, showAssignButton = false) => (
    <Grid item xs={12} md={6} lg={4} key={pr.id}>
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Typography variant="h6" component="h2" noWrap>
              {pr.accountInfo}
            </Typography>
            <Chip
              label={getStatusLabel(pr.analystStatus || pr.salesStatus)}
              color={getStatusColor(pr.analystStatus || pr.salesStatus) as any}
              size="small"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Shipment: {safeFormatDate(pr.shipmentDate, "MMM dd, yyyy")}
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            From: {pr.originAddress ? `${pr.originAddress}, ` : ""}
            {pr.originState || "N/A"}
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            To: {pr.destAddress ? `${pr.destAddress}, ` : ""}
            {pr.destState || "N/A"}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Items: {pr.items?.length || 0} item(s)
          </Typography>

          <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <IconButton
              size="small"
              onClick={() => handleViewPR(pr.id)}
              color="primary"
              title="View Details"
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
                sx={{ fontSize: "0.75rem" }}
              >
                Assign
              </Button>
            )}

            {pr.analystStatus === PRStatus.UNDER_REVIEW && (
              <>
                <IconButton
                  size="small"
                  onClick={() => handleViewPR(pr.id)}
                  color="success"
                >
                  <ApproveIcon />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => handleViewPR(pr.id)}
                  color="error"
                >
                  <RejectIcon />
                </IconButton>
              </>
            )}

            {pr.analystStatus === PRStatus.ACTION_REQUIRED && (
              <IconButton
                size="small"
                onClick={() => handleViewPR(pr.id)}
                color="warning"
              >
                <CommentIcon />
              </IconButton>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Pricing Analyst Dashboard
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Available PRs" />
          <Tab label="My Assigned PRs" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Available Pricing Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click the "Assign" button to take ownership of unassigned pricing
            requests for review
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {availablePRs?.map((pr) => renderPRCard(pr, true))}
        </Grid>

        {availablePRs?.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No available pricing requests
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              All pricing requests have been assigned or processed
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            My Assigned Pricing Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pricing requests assigned to you for review and approval
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {myPRs?.map((pr) => renderPRCard(pr, false))}
        </Grid>

        {myPRs?.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No assigned pricing requests
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Assign pricing requests from the Available PRs tab to get started
            </Typography>
          </Box>
        )}
      </TabPanel>
    </Box>
  );
};
