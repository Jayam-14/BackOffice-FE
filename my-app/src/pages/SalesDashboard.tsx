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
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Send as SubmitIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { DashboardLayout } from '../components/DashboardLayout';
import { mockAPI } from '../services/mockData';
import { useAuth } from '../contexts/AuthContext';
import { PRStatus, UserRole } from '../types';
import { PRForm } from '../components/PRForm';
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

export const SalesDashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPR, setSelectedPR] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: prs, isLoading, error } = useQuery({
    queryKey: ['prs', user?.id, user?.role],
    queryFn: () => mockAPI.getPRs(user?.id || '', user?.role || UserRole.SALES_EXECUTIVE),
    enabled: !!user
  });

  const submitMutation = useMutation({
    mutationFn: (prId: string) => mockAPI.submitPR(prId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prs'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (prId: string) => mockAPI.deletePR(prId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prs'] });
    }
  });

  const handleCreatePR = () => {
    setIsCreateDialogOpen(true);
  };

  const handleViewPR = (pr: any) => {
    setSelectedPR(pr);
    setIsViewDialogOpen(true);
  };

  const handleEditPR = (pr: any) => {
    setSelectedPR(pr);
    setIsEditDialogOpen(true);
  };

  const handleSubmitPR = (prId: string) => {
    submitMutation.mutate(prId);
  };

  const handleDeletePR = (prId: string) => {
    if (window.confirm('Are you sure you want to delete this PR?')) {
      deleteMutation.mutate(prId);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Sales Dashboard">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Sales Dashboard">
        <Alert severity="error">Failed to load PRs</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Sales Dashboard">
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Pricing Requests
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreatePR}
            sx={{ backgroundColor: '#1976d2' }}
          >
            Create PR
          </Button>
        </Box>

        <Grid container spacing={3}>
          {prs?.map((pr) => (
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
                    
                    {pr.status === PRStatus.DRAFT && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleEditPR(pr)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        
                        <IconButton
                          size="small"
                          onClick={() => handleSubmitPR(pr.id)}
                          color="success"
                          disabled={submitMutation.isPending}
                        >
                          <SubmitIcon />
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
                    
                    {pr.status === PRStatus.ACTION_REQUIRED && (
                      <IconButton
                        size="small"
                        onClick={() => handleEditPR(pr)}
                        color="warning"
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {prs?.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No pricing requests found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Create your first pricing request to get started
            </Typography>
          </Box>
        )}
      </Box>

      {/* Create PR Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Pricing Request</DialogTitle>
        <DialogContent>
          <PRForm
            onSubmit={(data) => {
              // Handle PR creation
              setIsCreateDialogOpen(false);
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit PR Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Pricing Request</DialogTitle>
        <DialogContent>
          {selectedPR && (
            <PRForm
              initialData={selectedPR}
              onSubmit={(data) => {
                // Handle PR update
                setIsEditDialogOpen(false);
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View PR Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>View Pricing Request</DialogTitle>
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