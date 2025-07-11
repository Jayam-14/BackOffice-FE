import React from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  FormControlLabel,
  Checkbox,
  IconButton,
  Card,
  CardContent,
  Divider,
  Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { prFormSchema, type PRFormData } from '../utils/validation';
import type { ItemInfo } from '../types';

interface PRFormProps {
  initialData?: PRFormData;
  onSubmit: (data: PRFormData, action: 'save' | 'submit') => void;
  onCancel?: () => void;
}

const defaultItem: ItemInfo = {
  itemName: '',
  commodityClass: '',
  totalWeight: 0,
  handlingUnits: 'Pallet',
  numberOfPieces: 0,
  containerTypes: '',
  numberOfPallets: 0
};

export const PRForm: React.FC<PRFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<PRFormData>({
    resolver: zodResolver(prFormSchema),
    defaultValues: initialData || {
      shipmentDate: new Date(),
      accountInfo: '',
      discount: '',
      startingAddress: '',
      startingState: '',
      startingZip: '',
      startingCountry: '',
      destinationAddress: '',
      destinationState: '',
      destinationZip: '',
      destinationCountry: '',
      items: [defaultItem],
      accessorial: '',
      pickup: '',
      delivery: '',
      daylightProtectCoverage: false,
      insuranceDescription: '',
      insuranceNote: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchedItems = watch('items');

  const handleSave = (data: PRFormData) => {
    onSubmit(data, 'save');
  };

  const handleSubmitForm = (data: PRFormData) => {
    onSubmit(data, 'submit');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" sx={{ mt: 2 }}>
        {/* Header Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Header Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Shipment Date"
                  value={watch('shipmentDate')}
                  onChange={(newValue) => setValue('shipmentDate', newValue || new Date())}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.shipmentDate,
                      helperText: errors.shipmentDate?.message
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Account Info"
                  {...register('accountInfo')}
                  error={!!errors.accountInfo}
                  helperText={errors.accountInfo?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Discount"
                  {...register('discount')}
                  error={!!errors.discount}
                  helperText={errors.discount?.message}
                  placeholder="e.g., 15%"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Origin Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Origin Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Starting Address"
                  {...register('startingAddress')}
                  error={!!errors.startingAddress}
                  helperText={errors.startingAddress?.message}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  {...register('startingState')}
                  error={!!errors.startingState}
                  helperText={errors.startingState?.message}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  {...register('startingZip')}
                  error={!!errors.startingZip}
                  helperText={errors.startingZip?.message}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Country"
                  {...register('startingCountry')}
                  error={!!errors.startingCountry}
                  helperText={errors.startingCountry?.message}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Destination Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Destination Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Destination Address"
                  {...register('destinationAddress')}
                  error={!!errors.destinationAddress}
                  helperText={errors.destinationAddress?.message}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  {...register('destinationState')}
                  error={!!errors.destinationState}
                  helperText={errors.destinationState?.message}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  {...register('destinationZip')}
                  error={!!errors.destinationZip}
                  helperText={errors.destinationZip?.message}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Country"
                  {...register('destinationCountry')}
                  error={!!errors.destinationCountry}
                  helperText={errors.destinationCountry?.message}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Items Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Items
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => append(defaultItem)}
                variant="outlined"
                size="small"
              >
                Add Item
              </Button>
            </Box>

            {fields.map((field, index) => (
              <Card key={field.id} sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Item {index + 1}
                  </Typography>
                  {fields.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => remove(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Item Name"
                      {...register(`items.${index}.itemName`)}
                      error={!!errors.items?.[index]?.itemName}
                      helperText={errors.items?.[index]?.itemName?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Commodity Class"
                      {...register(`items.${index}.commodityClass`)}
                      error={!!errors.items?.[index]?.commodityClass}
                      helperText={errors.items?.[index]?.commodityClass?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Total Weight (lbs)"
                      type="number"
                      {...register(`items.${index}.totalWeight`, { valueAsNumber: true })}
                      error={!!errors.items?.[index]?.totalWeight}
                      helperText={errors.items?.[index]?.totalWeight?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Handling Unit"
                      {...register(`items.${index}.handlingUnits`)}
                      error={!!errors.items?.[index]?.handlingUnits}
                      helperText={errors.items?.[index]?.handlingUnits?.message}
                      placeholder="e.g., Pallet, Box, Crate"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Number of Pieces"
                      type="number"
                      {...register(`items.${index}.numberOfPieces`, { valueAsNumber: true })}
                      error={!!errors.items?.[index]?.numberOfPieces}
                      helperText={errors.items?.[index]?.numberOfPieces?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Container Types"
                      {...register(`items.${index}.containerTypes`)}
                      error={!!errors.items?.[index]?.containerTypes}
                      helperText={errors.items?.[index]?.containerTypes?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Number of Pallets"
                      type="number"
                      {...register(`items.${index}.numberOfPallets`, { valueAsNumber: true })}
                      error={!!errors.items?.[index]?.numberOfPallets}
                      helperText={errors.items?.[index]?.numberOfPallets?.message}
                    />
                  </Grid>
                </Grid>
              </Card>
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
                <TextField
                  fullWidth
                  label="Accessorial"
                  {...register('accessorial')}
                  error={!!errors.accessorial}
                  helperText={errors.accessorial?.message}
                  placeholder="e.g., Liftgate, Notification"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Pickup"
                  {...register('pickup')}
                  error={!!errors.pickup}
                  helperText={errors.pickup?.message}
                  placeholder="e.g., Standard, Next Day"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Delivery"
                  {...register('delivery')}
                  error={!!errors.delivery}
                  helperText={errors.delivery?.message}
                  placeholder="e.g., Express, White Glove"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Insurance */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Insurance
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  {...register('daylightProtectCoverage')}
                  checked={watch('daylightProtectCoverage')}
                />
              }
              label="Daylight Protect Coverage"
            />
            {watch('daylightProtectCoverage') && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Insurance Description"
                    multiline
                    rows={3}
                    {...register('insuranceDescription')}
                    error={!!errors.insuranceDescription}
                    helperText={errors.insuranceDescription?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Insurance Note"
                    multiline
                    rows={2}
                    {...register('insuranceNote')}
                    error={!!errors.insuranceNote}
                    helperText={errors.insuranceNote?.message}
                  />
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Form Actions:
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#1976d2' }} />
                <Typography variant="body2">
                  <strong>Save as Draft:</strong> Saves your work as a draft. You can edit it later.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#2e7d32' }} />
                <Typography variant="body2">
                  <strong>Submit for Review:</strong> Sends the PR to pricing analysts for review.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            onClick={handleSubmit(handleSave)}
            variant="outlined"
            disabled={isSubmitting}
            sx={{ 
              borderColor: '#1976d2', 
              color: '#1976d2',
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
            title="Save as draft - You can edit this later"
          >
            {isSubmitting ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button
            onClick={handleSubmit(handleSubmitForm)}
            variant="contained"
            disabled={isSubmitting}
            sx={{ 
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
            title="Submit for review - This will be sent to pricing analysts"
          >
            {isSubmitting ? 'Submitting...' : initialData ? 'Update & Submit' : 'Submit for Review'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}; 