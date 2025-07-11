import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  IconButton,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { PRCreateData, PRItem } from "../types";

interface PRFormProps {
  initialData?: Partial<PRCreateData>;
  onSubmit: (data: PRCreateData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const defaultItem: PRItem = {
  id: "",
  itemName: "",
  commodityClass: "",
  totalWeight: 0,
  handlingUnit: "",
  noOfPieces: 0,
  containerType: "",
  noOfPallets: 0,
};

export const PRForm: React.FC<PRFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Submit",
}) => {
  const [formData, setFormData] = useState<PRCreateData>({
    shipmentDate: new Date(),
    accountInfo: "",
    discount: "",
    originAddress: "",
    originState: "",
    originZip: "",
    originCountry: "USA",
    destAddress: "",
    destState: "",
    destZip: "",
    destCountry: "USA",
    accessorial: "",
    pickup: "",
    delivery: "",
    daylightProtect: false,
    items: [defaultItem],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountInfo.trim()) {
      newErrors.accountInfo = "Account info is required";
    }

    if (!formData.originAddress.trim()) {
      newErrors.originAddress = "Origin address is required";
    }

    if (!formData.originState.trim()) {
      newErrors.originState = "Origin state is required";
    }

    if (!formData.originZip.trim()) {
      newErrors.originZip = "Origin ZIP is required";
    }

    if (!formData.destAddress.trim()) {
      newErrors.destAddress = "Destination address is required";
    }

    if (!formData.destState.trim()) {
      newErrors.destState = "Destination state is required";
    }

    if (!formData.destZip.trim()) {
      newErrors.destZip = "Destination ZIP is required";
    }

    // Validate items
    formData.items.forEach((item, index) => {
      if (!item.itemName.trim()) {
        newErrors[`item${index}Name`] = "Item name is required";
      }
      if (!item.commodityClass.trim()) {
        newErrors[`item${index}Class`] = "Commodity class is required";
      }
      if (item.totalWeight <= 0) {
        newErrors[`item${index}Weight`] = "Total weight must be greater than 0";
      }
      if (item.noOfPieces <= 0) {
        newErrors[`item${index}Pieces`] =
          "Number of pieces must be greater than 0";
      }
      if (item.noOfPallets <= 0) {
        newErrors[`item${index}Pallets`] =
          "Number of pallets must be greater than 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleItemChange =
    (index: number, field: keyof PRItem) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newItems = [...formData.items];
      newItems[index] = {
        ...newItems[index],
        [field]:
          field === "totalWeight" ||
          field === "noOfPieces" ||
          field === "noOfPallets"
            ? parseFloat(event.target.value) || 0
            : event.target.value,
      };
      setFormData((prev) => ({ ...prev, items: newItems }));

      // Clear error when user starts typing
      const errorKey = `item${index}${
        field.charAt(0).toUpperCase() + field.slice(1)
      }`;
      if (errors[errorKey]) {
        setErrors((prev) => ({ ...prev, [errorKey]: "" }));
      }
    };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { ...defaultItem, id: Date.now().toString() }],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ maxWidth: 800, mx: "auto" }}
      >
        <Typography variant="h5" gutterBottom>
          Pricing Request Details
        </Typography>

        {/* Header Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Header Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Shipment Date"
                  value={formData.shipmentDate}
                  onChange={(newValue) =>
                    setFormData((prev) => ({
                      ...prev,
                      shipmentDate: newValue || new Date(),
                    }))
                  }
                  slotProps={{
                    textField: { fullWidth: true, margin: "normal" },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Account Info"
                  value={formData.accountInfo}
                  onChange={handleInputChange("accountInfo")}
                  margin="normal"
                  error={!!errors.accountInfo}
                  helperText={errors.accountInfo}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Discount"
                  value={formData.discount}
                  onChange={handleInputChange("discount")}
                  margin="normal"
                  placeholder="e.g., 10%"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.daylightProtect}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          daylightProtect: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="Daylight Protection"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Origin Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Origin Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Origin Address"
                  value={formData.originAddress}
                  onChange={handleInputChange("originAddress")}
                  margin="normal"
                  error={!!errors.originAddress}
                  helperText={errors.originAddress}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.originState}
                  onChange={handleInputChange("originState")}
                  margin="normal"
                  error={!!errors.originState}
                  helperText={errors.originState}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={formData.originZip}
                  onChange={handleInputChange("originZip")}
                  margin="normal"
                  error={!!errors.originZip}
                  helperText={errors.originZip}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.originCountry}
                  onChange={handleInputChange("originCountry")}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Destination Information */}
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
                  value={formData.destAddress}
                  onChange={handleInputChange("destAddress")}
                  margin="normal"
                  error={!!errors.destAddress}
                  helperText={errors.destAddress}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.destState}
                  onChange={handleInputChange("destState")}
                  margin="normal"
                  error={!!errors.destState}
                  helperText={errors.destState}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={formData.destZip}
                  onChange={handleInputChange("destZip")}
                  margin="normal"
                  error={!!errors.destZip}
                  helperText={errors.destZip}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.destCountry}
                  onChange={handleInputChange("destCountry")}
                  margin="normal"
                />
              </Grid>
            </Grid>
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
                  value={formData.accessorial}
                  onChange={handleInputChange("accessorial")}
                  margin="normal"
                  placeholder="e.g., Liftgate"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Pickup"
                  value={formData.pickup}
                  onChange={handleInputChange("pickup")}
                  margin="normal"
                  placeholder="e.g., Standard"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Delivery"
                  value={formData.delivery}
                  onChange={handleInputChange("delivery")}
                  margin="normal"
                  placeholder="e.g., Express"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Items */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Items</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addItem}
                variant="outlined"
                size="small"
              >
                Add Item
              </Button>
            </Box>

            {formData.items.map((item, index) => (
              <Box
                key={index}
                sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 1 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle1">Item {index + 1}</Typography>
                  {formData.items.length > 1 && (
                    <IconButton
                      onClick={() => removeItem(index)}
                      color="error"
                      size="small"
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
                      value={item.itemName}
                      onChange={handleItemChange(index, "itemName")}
                      margin="normal"
                      error={!!errors[`item${index}Name`]}
                      helperText={errors[`item${index}Name`]}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Commodity Class"
                      value={item.commodityClass}
                      onChange={handleItemChange(index, "commodityClass")}
                      margin="normal"
                      error={!!errors[`item${index}Class`]}
                      helperText={errors[`item${index}Class`]}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Total Weight (lbs)"
                      type="number"
                      value={item.totalWeight}
                      onChange={handleItemChange(index, "totalWeight")}
                      margin="normal"
                      error={!!errors[`item${index}Weight`]}
                      helperText={errors[`item${index}Weight`]}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Handling Unit"
                      value={item.handlingUnit}
                      onChange={handleItemChange(index, "handlingUnit")}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Number of Pieces"
                      type="number"
                      value={item.noOfPieces}
                      onChange={handleItemChange(index, "noOfPieces")}
                      margin="normal"
                      error={!!errors[`item${index}Pieces`]}
                      helperText={errors[`item${index}Pieces`]}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Container Type"
                      value={item.containerType}
                      onChange={handleItemChange(index, "containerType")}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Number of Pallets"
                      type="number"
                      value={item.noOfPallets}
                      onChange={handleItemChange(index, "noOfPallets")}
                      margin="normal"
                      error={!!errors[`item${index}Pallets`]}
                      helperText={errors[`item${index}Pallets`]}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button onClick={onCancel} variant="outlined" disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {submitLabel}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};
