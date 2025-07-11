import React, { useState, useEffect } from 'react';
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
import { DashboardLayout } from '../component/DashboardLayout';
import { salesPRService } from '../services/prService';
import { useAuth } from '../contexts/AuthContext';
import { PRStatus, UserRole } from '../types';
import { PRForm } from '../component/PRForm';
import { PRViewDialog } from '../component/PRViewDialog';

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

  console.log('SalesDashboard - User:', user);
  console.log('SalesDashboard - User enabled:', !!user);
  


  const { data: prs, isLoading, error } = useQuery({
    queryKey: ['sales-prs', user?.id, user?.role],
    queryFn: async () => {
      console.log('SalesDashboard - Fetching Sales PRs...');
      try {
        const result = await salesPRService.getPRs();
        console.log('SalesDashboard - Sales PRs fetched successfully:', result);
        console.log('SalesDashboard - PRs type:', typeof result);
        console.log('SalesDashboard - PRs length:', Array.isArray(result) ? result.length : 'Not an array');
        if (Array.isArray(result) && result.length > 0) {
          console.log('SalesDashboard - First PR structure:', result[0]);
        }
        return result;
      } catch (err) {
        console.error('SalesDashboard - Error fetching PRs:', err);
        throw err;
      }
    },
    enabled: !!user
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => salesPRService.createPR(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prs'] });
      setIsCreateDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ prId, data }: { prId: string; data: any }) => salesPRService.updatePR(prId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prs'] });
      setIsEditDialogOpen(false);
    }
  });

  const submitMutation = useMutation({
    mutationFn: (prData: any) => salesPRService.submitPR(prData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prs'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (prId: string) => salesPRService.deletePR(prId),
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

  const handleSubmitPR = (pr: any) => {
    submitMutation.mutate(pr);
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
                          onClick={() => handleSubmitPR(pr)}
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
              createMutation.mutate(data);
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
                updateMutation.mutate({ prId: selectedPR.id, data });
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