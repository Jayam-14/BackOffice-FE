import React, { useState } from 'react';
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
  DialogActions,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { DashboardLayout } from '../components/DashboardLayout';
import { mockAPI } from '../services/mockData';
import { useAuth } from '../contexts/AuthContext';
import { PRStatus, UserRole } from '../types';
import { PRViewDialog } from '../components/PRViewDialog';

const getStatusColor = (status: string) => {
  switch (status) {
    case PRStatus.DRAFT:
      return 'default';
    case PRStatus.UNDER_REVIEW:
      return 'warning';
    case PRStatus.ACTION_REQUIRED:
      return 'error';
    case PRStatus.APPROVED:
      return 'success';
    case PRStatus.REJECTED:
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case PRStatus.DRAFT:
      return 'Draft';
    case PRStatus.UNDER_REVIEW:
      return 'Under Review';
    case PRStatus.ACTION_REQUIRED:
      return 'Action Required';
    case PRStatus.APPROVED:
      return 'Approved';
    case PRStatus.REJECTED:
      return 'Rejected';
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
  const queryClient = useQueryClient();
  const [selectedPR, setSelectedPR] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const { data: prs, isLoading, error } = useQuery({
    queryKey: ['prs', user?.id, user?.role],
    queryFn: () => mockAPI.getPRs(user?.id || '', user?.role || UserRole.PRICING_ANALYST),
    enabled: !!user
  });

  const approveMutation = useMutation({
    mutationFn: (prId: string) => mockAPI.approvePR(prId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prs'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (prId: string) => mockAPI.rejectPR(prId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prs'] });
    }
  });

  const handleViewPR = (pr: any) => {
    setSelectedPR(pr);
    setIsViewDialogOpen(true);
  };

  const handleApprovePR = (prId: string) => {
    if (window.confirm('Are you sure you want to approve this PR?')) {
      approveMutation.mutate(prId);
    }
  };

  const handleRejectPR = (prId: string) => {
    if (window.confirm('Are you sure you want to reject this PR?')) {
      rejectMutation.mutate(prId);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filterPRsByStatus = (status: string) => {
    return prs?.filter(pr => pr.status === status) || [];
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Analyst Dashboard">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Analyst Dashboard">
        <Alert severity="error">Failed to load PRs</Alert>
      </DashboardLayout>
    );
  }

  const renderPRCard = (pr: any) => (
    <Grid item xs={12} md={6} lg={4} key={pr.id}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="h2" noWrap>
              {pr.accountInfo}
            </Typography>
            <Chip
              label={getStatusLabel(pr.status)}
              color={getStatusColor(pr.status) as any}
              size="small"
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Shipment: {format(new Date(pr.shipmentDate), 'MMM dd, yyyy')}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            From: {pr.startingAddress}, {pr.startingState}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            To: {pr.destinationAddress}, {pr.destinationState}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Items: {pr.items.length} item(s)
          </Typography>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <IconButton
              size="small"
              onClick={() => handleViewPR(pr)}
              color="primary"
            >
              <ViewIcon />
            </IconButton>
            
            {pr.status === PRStatus.UNDER_REVIEW && (
              <>
                <IconButton
                  size="small"
                  onClick={() => handleApprovePR(pr.id)}
                  color="success"
                  disabled={approveMutation.isPending}
                >
                  <ApproveIcon />
                </IconButton>
                
                <IconButton
                  size="small"
                  onClick={() => handleRejectPR(pr.id)}
                  color="error"
                  disabled={rejectMutation.isPending}
                >
                  <RejectIcon />
                </IconButton>
              </>
            )}
            
            {pr.status === PRStatus.ACTION_REQUIRED && (
              <IconButton
                size="small"
                onClick={() => handleViewPR(pr)}
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
    <DashboardLayout title="Analyst Dashboard">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pricing Requests Review
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="PR status tabs">
            <Tab label={`Under Review (${filterPRsByStatus(PRStatus.UNDER_REVIEW).length})`} />
            <Tab label={`Action Required (${filterPRsByStatus(PRStatus.ACTION_REQUIRED).length})`} />
            <Tab label={`Approved (${filterPRsByStatus(PRStatus.APPROVED).length})`} />
            <Tab label={`Rejected (${filterPRsByStatus(PRStatus.REJECTED).length})`} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {filterPRsByStatus(PRStatus.UNDER_REVIEW).map(renderPRCard)}
            {filterPRsByStatus(PRStatus.UNDER_REVIEW).length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No PRs under review
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {filterPRsByStatus(PRStatus.ACTION_REQUIRED).map(renderPRCard)}
            {filterPRsByStatus(PRStatus.ACTION_REQUIRED).length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No PRs requiring action
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {filterPRsByStatus(PRStatus.APPROVED).map(renderPRCard)}
            {filterPRsByStatus(PRStatus.APPROVED).length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No approved PRs
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {filterPRsByStatus(PRStatus.REJECTED).map(renderPRCard)}
            {filterPRsByStatus(PRStatus.REJECTED).length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No rejected PRs
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Box>

      {/* View PR Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Review Pricing Request</DialogTitle>
        <DialogContent>
          {selectedPR && (
            <PRViewDialog
              pr={selectedPR}
              onClose={() => setIsViewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}; 