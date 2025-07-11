import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Button,
  Alert
} from '@mui/material';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commentSchema, type CommentFormData } from '../utils/validation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mockAPI } from '../services/mockData';
import { useAuth } from '../contexts/AuthContext';
import type { PR } from '../types';

interface PRViewDialogProps {
  pr: PR;
  onClose: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'default';
    case 'UNDER_REVIEW':
      return 'warning';
    case 'ACTION_REQUIRED':
      return 'error';
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'UNDER_REVIEW':
      return 'Under Review';
    case 'ACTION_REQUIRED':
      return 'Action Required';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    default:
      return status;
  }
};

export const PRViewDialog: React.FC<PRViewDialogProps> = ({ pr, onClose }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema)
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: CommentFormData) =>
      mockAPI.addComment({
        pr_id: pr.id,
        user_id: user?.id || '',
        role: user?.role || 'SALES_EXECUTIVE',
        comment_text: data.comment_text
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prs'] });
      reset();
    }
  });

  const handleAddComment = (data: CommentFormData) => {
    addCommentMutation.mutate(data);
  };

  return (
    <Box sx={{ maxHeight: '80vh', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            {pr.accountInfo}
          </Typography>
          <Chip
            label={getStatusLabel(pr.status)}
            color={getStatusColor(pr.status) as any}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Created: {format(new Date(pr.last_updated), 'MMM dd, yyyy HH:mm')}
        </Typography>
      </Box>

      {/* PR Details */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Header Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Header Information
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Shipment Date:</strong> {format(new Date(pr.shipmentDate), 'MMM dd, yyyy')}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Account:</strong> {pr.accountInfo}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Discount:</strong> {pr.discount}%
            </Typography>
          </Paper>
        </Grid>

        {/* Origin */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Origin
            </Typography>
            <Typography variant="body2" gutterBottom>
              {pr.startingAddress}
            </Typography>
            <Typography variant="body2" gutterBottom>
              {pr.startingState}, {pr.startingZip}
            </Typography>
            <Typography variant="body2" gutterBottom>
              {pr.startingCountry}
            </Typography>
          </Paper>
        </Grid>

        {/* Destination */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Destination
            </Typography>
            <Typography variant="body2" gutterBottom>
              {pr.destinationAddress}
            </Typography>
            <Typography variant="body2" gutterBottom>
              {pr.destinationState}, {pr.destinationZip}
            </Typography>
            <Typography variant="body2" gutterBottom>
              {pr.destinationCountry}
            </Typography>
          </Paper>
        </Grid>

        {/* Additional Services */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Additional Services
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {pr.accessorial && <Chip label="Accessorial" size="small" />}
              {pr.pickup && <Chip label="Pickup" size="small" />}
              {pr.delivery && <Chip label="Delivery" size="small" />}
              {pr.daylightProtectCoverage && <Chip label="Daylight Protect Coverage" size="small" />}
            </Box>
            {pr.insuranceDescription && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Insurance:</strong> {pr.insuranceDescription}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Items */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Items ({pr.items.length})
        </Typography>
        {pr.items.map((item, index) => (
          <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Item {index + 1}: {item.itemName}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="body2">
                  <strong>Class:</strong> {item.commodityClass}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2">
                  <strong>Weight:</strong> {item.totalWeight} lbs
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2">
                  <strong>Units:</strong> {item.handlingUnits}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2">
                  <strong>Pieces:</strong> {item.numberOfPieces}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2">
                  <strong>Containers:</strong> {item.containerTypes}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2">
                  <strong>Pallets:</strong> {item.numberOfPallets}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        ))}
      </Paper>

      {/* Comments */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Comments ({pr.comments.length})
        </Typography>

        {pr.comments.length > 0 ? (
          <List>
            {pr.comments.map((comment) => (
              <ListItem key={comment.comment_id} divider>
                <ListItemText
                  primary={comment.comment_text}
                  secondary={`${comment.role} - ${format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No comments yet
          </Typography>
        )}

        {/* Add Comment Form */}
        <Divider sx={{ my: 2 }} />
        <Box component="form" onSubmit={handleSubmit(handleAddComment)}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Add a comment"
            {...register('comment_text')}
            error={!!errors.comment_text}
            helperText={errors.comment_text?.message}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={addCommentMutation.isPending}
            sx={{ backgroundColor: '#1976d2' }}
          >
            {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}; 