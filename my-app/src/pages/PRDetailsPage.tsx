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
  Divider,
  Paper
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SubmitIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { DashboardLayout } from '../component/DashboardLayout';
import { mockAPI } from '../services/mockData';
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

export const PRDetailsPage: React.FC = () => {
  const { prId } = useParams<{ prId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: pr, isLoading, error } = useQuery({
    queryKey: ['pr', prId],
    queryFn: () => mockAPI.getPR(prId!),
    enabled: !!prId
  });

  const updateMutation = useMutation({
    mutationFn: ({ prId, data }: { prId: string; data: any }) => mockAPI.updatePR(prId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pr', prId] });
      queryClient.invalidateQueries({ queryKey: ['prs'] });
      setIsEditDialogOpen(false);
    }
  });

  const submitMutation = useMutation({
    mutationFn: (prId: string) => mockAPI.submitPR(prId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pr', prId] });
      queryClient.invalidateQueries({ queryKey: ['prs'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (prId: string) => mockAPI.deletePR(prId),
    onSuccess: () => {
      navigate('/sales');
    }
  });

  const handleEditPR = () => {
    setIsEditDialogOpen(true);
  };

  const handleSubmitPR = () => {
    if (window.confirm('Are you sure you want to submit this PR for review?')) {
      submitMutation.mutate(prId!);
    }
  };

  const handleDeletePR = () => {
    if (window.confirm('Are you sure you want to delete this PR?')) {
      deleteMutation.mutate(prId!);
    }
  };

  const handlePRFormSubmit = (data: any, action: 'save' | 'submit') => {
    if (action === 'save') {
      // Update existing PR as draft
      updateMutation.mutate({ prId: prId!, data });
    } else {
      // Update and submit existing PR
      updateMutation.mutate({ 
        prId: prId!, 
        data: { ...data, status: PRStatus.UNDER_REVIEW, submission_date: new Date() }
      });
    }
  };

  const handleBack = () => {
    navigate('/sales');
  };

  if (isLoading) {
    return (
      <DashboardLayout title="PR Details">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !pr) {
    return (
      <DashboardLayout title="PR Details">
        <Alert severity="error">Failed to load PR details</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="PR Details">
      <Box sx={{ mb: 3 }}>
        {/* Header with Back Button and Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<BackIcon />}
              onClick={handleBack}
              variant="outlined"
              size="small"
            >
              Back to Sales Dashboard
            </Button>
            <Typography variant="h4" component="h1">
              PR #{pr.id}
            </Typography>
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {pr.status === PRStatus.DRAFT && (
              <>
                <Button
                  startIcon={<EditIcon />}
                  onClick={handleEditPR}
                  variant="outlined"
                  color="primary"
                >
                  Edit
                </Button>
                <Button
                  startIcon={<SubmitIcon />}
                  onClick={handleSubmitPR}
                  variant="contained"
                  color="success"
                  disabled={submitMutation.isPending}
                >
                  Submit for Review
                </Button>
                <Button
                  startIcon={<DeleteIcon />}
                  onClick={handleDeletePR}
                  variant="outlined"
                  color="error"
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </>
            )}
            
            {pr.status === PRStatus.ACTION_REQUIRED && (
              <Button
                startIcon={<EditIcon />}
                onClick={handleEditPR}
                variant="outlined"
                color="warning"
              >
                Edit
              </Button>
            )}
          </Box>
        </Box>

        {/* Status and Basic Info */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {pr.accountInfo}
              </Typography>
              <Chip
                label={getStatusLabel(pr.status)}
                color={getStatusColor(pr.status) as any}
                size="medium"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Shipment Date: {format(new Date(pr.shipmentDate), 'MMMM dd, yyyy')}
            </Typography>
            {pr.submission_date && (
              <Typography variant="body2" color="text.secondary">
                Submitted: {format(new Date(pr.submission_date), 'MMMM dd, yyyy')}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Origin and Destination */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Origin
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {pr.startingAddress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {pr.startingState}, {pr.startingZip}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {pr.startingCountry}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Destination
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {pr.destinationAddress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {pr.destinationState}, {pr.destinationZip}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {pr.destinationCountry}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Items */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Items ({pr.items.length})
            </Typography>
            {pr.items.map((item, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Item {index + 1}: {item.itemName}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Commodity Class:</strong> {item.commodityClass}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Total Weight:</strong> {item.totalWeight} lbs
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Handling Units:</strong> {item.handlingUnits}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Number of Pieces:</strong> {item.numberOfPieces}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Container Types:</strong> {item.containerTypes}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Number of Pallets:</strong> {item.numberOfPallets}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </CardContent>
        </Card>

        {/* Additional Services */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Additional Services
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2">
                  <strong>Accessorial:</strong> {pr.accessorial ? 'Yes' : 'No'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2">
                  <strong>Pickup:</strong> {pr.pickup ? 'Yes' : 'No'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2">
                  <strong>Delivery:</strong> {pr.delivery ? 'Yes' : 'No'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Insurance */}
        {pr.daylightProtectCoverage && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Insurance
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Daylight Protect Coverage:</strong> Yes
              </Typography>
              {pr.insuranceDescription && (
                <Typography variant="body2" gutterBottom>
                  <strong>Description:</strong> {pr.insuranceDescription}
                </Typography>
              )}
              {pr.insuranceNote && (
                <Typography variant="body2">
                  <strong>Note:</strong> {pr.insuranceNote}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {/* Discount */}
        {pr.discount > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pricing
              </Typography>
              <Typography variant="body2">
                <strong>Discount:</strong> {pr.discount}%
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

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
          <PRForm
            initialData={pr}
            onSubmit={handlePRFormSubmit}
            onCancel={() => {}} // Empty function since cancel is handled in dialog header
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}; 