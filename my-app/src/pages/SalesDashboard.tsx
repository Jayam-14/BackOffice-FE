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
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { DashboardLayout } from '../component/DashboardLayout';
import { mockAPI } from '../services/mockData';
import { useAuth } from '../contexts/AuthContext';
import { PRStatus, UserRole } from '../types';
import { PRForm } from '../component/PRForm';

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPR, setSelectedPR] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: prs, isLoading, error } = useQuery({
    queryKey: ['prs', user?.id, user?.role],
    queryFn: () => mockAPI.getPRs(user?.id || '', user?.role || UserRole.SALES_EXECUTIVE),
    enabled: !!user
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => mockAPI.createPR(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prs'] });
      setIsCreateDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ prId, data }: { prId: string; data: any }) => mockAPI.updatePR(prId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prs'] });
      setIsEditDialogOpen(false);
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

  const handleEditPR = (pr: any) => {
    setSelectedPR(pr);
    setIsEditDialogOpen(true);
  };

  const handleDeletePR = (prId: string) => {
    if (window.confirm('Are you sure you want to delete this PR?')) {
      deleteMutation.mutate(prId);
    }
  };

  const handlePRFormSubmit = (data: any, action: 'save' | 'submit') => {
    if (action === 'save') {
      // Save as draft
      if (selectedPR) {
        // Update existing PR
        updateMutation.mutate({ prId: selectedPR.id, data });
      } else {
        // Create new PR as draft
        createMutation.mutate(data);
      }
    } else {
      // Submit for review
      if (selectedPR) {
        // Update and submit existing PR
        updateMutation.mutate({ 
          prId: selectedPR.id, 
          data: { ...data, status: PRStatus.UNDER_REVIEW, submission_date: new Date() }
        });
      } else {
        // Create new PR and submit immediately
        createMutation.mutate({ ...data, status: PRStatus.UNDER_REVIEW, submission_date: new Date() });
      }
    }
  };

  const handleRowClick = (pr: any) => {
    navigate(`/pr/${pr.id}`);
  };

  const isActionDisabled = (status: string) => {
    return status !== PRStatus.DRAFT;
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

        {prs && prs.length > 0 ? (
          <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>PR ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Account Info</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Origin</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Destination</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Shipment Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prs.map((pr) => (
                  <TableRow
                    key={pr.id}
                    onClick={() => handleRowClick(pr)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f8f9fa'
                      },
                      '&:nth-of-type(odd)': {
                        backgroundColor: '#fafafa'
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'medium' }}>
                      #{pr.id}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {pr.accountInfo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {pr.startingAddress}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {pr.startingState}, {pr.startingZip}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {pr.destinationAddress}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {pr.destinationState}, {pr.destinationZip}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {format(new Date(pr.shipmentDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(pr.status)}
                        color={getStatusColor(pr.status) as any}
                        size="small"
                        sx={{ fontWeight: 'medium' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {pr.status === PRStatus.DRAFT && (
                          <>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPR(pr);
                              }}
                              color="primary"
                              title="Edit PR"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePR(pr.id);
                              }}
                              color="error"
                              disabled={deleteMutation.isPending}
                              title="Delete PR"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                        
                        {pr.status === PRStatus.ACTION_REQUIRED && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPR(pr);
                            }}
                            color="warning"
                            title="Edit PR"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        
                        {isActionDisabled(pr.status) && (
                          <IconButton
                            size="small"
                            disabled
                            sx={{ color: 'text.disabled' }}
                            title="Actions disabled for this status"
                          >
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
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
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Create New Pricing Request
          <IconButton
            onClick={() => setIsCreateDialogOpen(false)}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <PRForm
            onSubmit={handlePRFormSubmit}
            onCancel={() => {}} // Empty function since cancel is handled in dialog header
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
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit Pricing Request
          <IconButton
            onClick={() => setIsEditDialogOpen(false)}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedPR && (
            <PRForm
              initialData={selectedPR}
              onSubmit={handlePRFormSubmit}
              onCancel={() => {}} // Empty function since cancel is handled in dialog header
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}; 