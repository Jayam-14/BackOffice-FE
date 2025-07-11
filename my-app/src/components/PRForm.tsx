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
  onSubmit: (data: PRFormData) => void;
  onCancel: () => void;
}

const defaultItem: ItemInfo = {
  itemName: '',
  commodityClass: '',
  totalWeight: 0,
  handlingUnits: 0,
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
      discount: 0,
      startingAddress: '',
      startingState: '',
      startingZip: '',
      startingCountry: '',
      destinationAddress: '',
      destinationState: '',
      destinationZip: '',
      destinationCountry: '',
      items: [defaultItem],
      accessorial: false,
      pickup: false,
      delivery: false,
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

  const handleFormSubmit = (data: PRFormData) => {
    onSubmit(data);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 2 }}>
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
                  label="Discount (%)"
                  type="number"
                  {...register('discount', { valueAsNumber: true })}
                  error={!!errors.discount}
                  helperText={errors.discount?.message}
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

        {/* Item Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Item Information
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
                      label="Handling Units"
                      type="number"
                      {...register(`items.${index}.handlingUnits`, { valueAsNumber: true })}
                      error={!!errors.items?.[index]?.handlingUnits}
                      helperText={errors.items?.[index]?.handlingUnits?.message}
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
                <FormControlLabel
                  control={
                    <Checkbox
                      {...register('accessorial')}
                      checked={watch('accessorial')}
                    />
                  }
                  label="Accessorial"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      {...register('pickup')}
                      checked={watch('pickup')}
                    />
                  }
                  label="Pickup"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      {...register('delivery')}
                      checked={watch('delivery')}
                    />
                  }
                  label="Delivery"
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
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ backgroundColor: '#1976d2' }}
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update PR' : 'Create PR'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}; 