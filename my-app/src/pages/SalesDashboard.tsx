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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { salesPRService } from "../services/prService";
import { PRStatus } from "../types";
import { PRForm } from "../component/PRForm";
import type { PR, PRCreateData } from "../types";

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
  });

  const createMutation = useMutation({
    mutationFn: (data: PRCreateData) => salesPRService.createPR(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-prs"] });
      setIsCreateDialogOpen(false);
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: PRCreateData) => salesPRService.submitPR(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-prs"] });
      setIsCreateDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (prId: string) => salesPRService.deletePR(prId),
    onSuccess: () => {
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
    return prs?.filter((pr) => pr.salesStatus === status) || [];
  };

  if (isLoading) {
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

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load PRs</Alert>
      </Box>
    );
  }

  const renderPRCard = (pr: PR) => (
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
              label={getStatusLabel(pr.salesStatus)}
              color={getStatusColor(pr.salesStatus) as any}
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
            >
              <ViewIcon />
            </IconButton>

            {pr.salesStatus === PRStatus.DRAFT && (
              <>
                <IconButton
                  size="small"
                  onClick={() => handleEditPR(pr.id)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => handleDeletePR(pr.id)}
                  color="error"
                  disabled={deleteMutation.isPending}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Sales Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreatePR}
          sx={{ backgroundColor: "#1976d2" }}
        >
          Create PR
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All" />
          <Tab label="Drafts" />
          <Tab label="Under Review" />
          <Tab label="Action Required" />
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>
      </Box>

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

      {/* Create PR Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Pricing Request</DialogTitle>
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
    </Box>
  );
};
