import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { salesPRService, paPRService } from "../services/prService";
import { PRForm } from "../component/PRForm";
import { UserRole, PRStatus } from "../types";

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

export const PRDetailsPage: React.FC = () => {
  const { prId } = useParams<{ prId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "action_required"
  >("approve");
  const [comment, setComment] = useState("");

  if (!prId) {
    return <Alert severity="error">PR ID is required</Alert>;
  }

  const {
    data: pr,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pr-details", prId],
    queryFn: () => {
      if (user?.role === UserRole.SALES_EXECUTIVE) {
        return salesPRService.getPRById(prId);
      } else {
        return paPRService.getPRById(prId);
      }
    },
    enabled: !!prId && !!user,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => salesPRService.updatePR(prId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pr-details", prId] });
      queryClient.invalidateQueries({ queryKey: ["sales-prs"] });
      setIsEditDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => salesPRService.deletePR(prId),
    onSuccess: () => {
      navigate("/sales");
    },
  });

  const sendToPAMutation = useMutation({
    mutationFn: () => salesPRService.sendToPA(prId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pr-details", prId] });
      queryClient.invalidateQueries({ queryKey: ["sales-prs"] });
    },
  });

  const resubmitMutation = useMutation({
    mutationFn: (data: any) => salesPRService.resubmitPR(prId, data),
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["pr-details", prId] });
      await queryClient.cancelQueries({ queryKey: ["sales-prs"] });

      // Snapshot the previous value
      const previousPR = queryClient.getQueryData(["pr-details", prId]);
      const previousPRs = queryClient.getQueryData(["sales-prs"]);

      // Optimistically update to the new value
      if (previousPR) {
        queryClient.setQueryData(["pr-details", prId], {
          ...previousPR,
          salesStatus: "Active Status",
          analystStatus: "Active Status",
          lastUpdated: new Date().toISOString(),
        });
      }

      // Return a context object with the snapshotted value
      return { previousPR, previousPRs };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPR) {
        queryClient.setQueryData(["pr-details", prId], context.previousPR);
      }
      if (context?.previousPRs) {
        queryClient.setQueryData(["sales-prs"], context.previousPRs);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["pr-details", prId] });
      queryClient.invalidateQueries({ queryKey: ["sales-prs"] });
      setIsEditDialogOpen(false);
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => paPRService.approvePR(prId, comment),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["pr-details", prId] });
      await queryClient.cancelQueries({ queryKey: ["pa-prs"] });

      const previousPR = queryClient.getQueryData(["pr-details", prId]);
      const previousPRs = queryClient.getQueryData(["pa-prs"]);

      if (previousPR) {
        queryClient.setQueryData(["pr-details", prId], {
          ...previousPR,
          analystStatus: "Approved",
          lastUpdated: new Date().toISOString(),
        });
      }

      return { previousPR, previousPRs };
    },
    onError: (err, variables, context) => {
      if (context?.previousPR) {
        queryClient.setQueryData(["pr-details", prId], context.previousPR);
      }
      if (context?.previousPRs) {
        queryClient.setQueryData(["pa-prs"], context.previousPRs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pr-details", prId] });
      queryClient.invalidateQueries({ queryKey: ["pa-prs"] });
      setIsActionDialogOpen(false);
      setComment("");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => paPRService.rejectPR(prId, comment),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["pr-details", prId] });
      await queryClient.cancelQueries({ queryKey: ["pa-prs"] });

      const previousPR = queryClient.getQueryData(["pr-details", prId]);
      const previousPRs = queryClient.getQueryData(["pa-prs"]);

      if (previousPR) {
        queryClient.setQueryData(["pr-details", prId], {
          ...previousPR,
          analystStatus: "Rejected",
          lastUpdated: new Date().toISOString(),
        });
      }

      return { previousPR, previousPRs };
    },
    onError: (err, variables, context) => {
      if (context?.previousPR) {
        queryClient.setQueryData(["pr-details", prId], context.previousPR);
      }
      if (context?.previousPRs) {
        queryClient.setQueryData(["pa-prs"], context.previousPRs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pr-details", prId] });
      queryClient.invalidateQueries({ queryKey: ["pa-prs"] });
      setIsActionDialogOpen(false);
      setComment("");
    },
  });

  const actionRequiredMutation = useMutation({
    mutationFn: () => paPRService.requestActionRequired(prId, comment),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["pr-details", prId] });
      await queryClient.cancelQueries({ queryKey: ["pa-prs"] });

      const previousPR = queryClient.getQueryData(["pr-details", prId]);
      const previousPRs = queryClient.getQueryData(["pa-prs"]);

      if (previousPR) {
        queryClient.setQueryData(["pr-details", prId], {
          ...previousPR,
          analystStatus: "Action Required",
          lastUpdated: new Date().toISOString(),
        });
      }

      return { previousPR, previousPRs };
    },
    onError: (err, variables, context) => {
      if (context?.previousPR) {
        queryClient.setQueryData(["pr-details", prId], context.previousPR);
      }
      if (context?.previousPRs) {
        queryClient.setQueryData(["pa-prs"], context.previousPRs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pr-details", prId] });
      queryClient.invalidateQueries({ queryKey: ["pa-prs"] });
      setIsActionDialogOpen(false);
      setComment("");
    },
  });

  const getStatusColor = (status: string, pr?: PR) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case PRStatus.DRAFT.toLowerCase():
        return "default";
      case PRStatus.UNDER_REVIEW.toLowerCase():
        return "warning";
      case PRStatus.ACTION_REQUIRED.toLowerCase():
        return "error";
      case PRStatus.APPROVED.toLowerCase():
        return "success";
      case PRStatus.REJECTED.toLowerCase():
        return "error";
      case PRStatus.ACTIVE_STATUS.toLowerCase():
      case "active status":
        return "info";
      case PRStatus.CLOSED.toLowerCase():
      case "closed":
        // For closed status, check if it was approved or rejected
        if (pr) {
          // First check the finalApprovalStatus field
          if (pr.finalApprovalStatus?.toLowerCase() === PRStatus.APPROVED.toLowerCase()) {
            return "success"; // Green for approved closed PRs
          } else if (pr.finalApprovalStatus?.toLowerCase() === PRStatus.REJECTED.toLowerCase()) {
            return "error"; // Red for rejected closed PRs
          }
          // Fallback: Check if the analyst status shows it was approved or rejected
          if (pr.analystStatus?.toLowerCase() === PRStatus.APPROVED.toLowerCase()) {
            return "success"; // Green for approved closed PRs
          } else if (pr.analystStatus?.toLowerCase() === PRStatus.REJECTED.toLowerCase()) {
            return "error"; // Red for rejected closed PRs
          }
          // Last resort: Check comments for approval/rejection indicators
          if (pr.comments && pr.comments.length > 0) {
            const lastComment = pr.comments[pr.comments.length - 1];
            if (lastComment.commentText?.toLowerCase().includes('approved')) {
              return "success"; // Green for approved closed PRs
            } else if (lastComment.commentText?.toLowerCase().includes('rejected')) {
              return "error"; // Red for rejected closed PRs
            }
          }
        }
        return "default";
      default:
        return "default";
    }
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this PR?")) {
      deleteMutation.mutate();
    }
  };

  const handleSendToPA = () => {
    if (window.confirm("Send this draft to Pricing Analyst for review?")) {
      sendToPAMutation.mutate();
    }
  };

  const handleAction = (type: "approve" | "reject" | "action_required") => {
    setActionType(type);
    setIsActionDialogOpen(true);
  };

  const handleActionSubmit = () => {
    if (actionType === "approve") {
      approveMutation.mutate();
    } else if (actionType === "reject") {
      rejectMutation.mutate();
    } else {
      actionRequiredMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load PR details</Alert>;
  }

  if (!pr) {
    return <Alert severity="error">PR not found</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Pricing Request Details
        </Typography>
      </Box>

      {/* Status and Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {user?.role === UserRole.SALES_EXECUTIVE ? (
            <Chip
              label={`Sales: ${pr.salesStatus}`}
              color={getStatusColor(pr.salesStatus, pr) as any}
            />
          ) : (
            <Chip
              label={`Analyst: ${pr.analystStatus || "Not Assigned"}`}
              color={getStatusColor(pr.analystStatus, pr) as any}
            />
          )}
          {pr.assignedTo && (
            <Chip
              label={`Assigned to: ${pr.assignedTo}`}
              color="info"
              variant="outlined"
            />
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          {user?.role === UserRole.SALES_EXECUTIVE && (
            <>
              {(pr.salesStatus?.toLowerCase() ===
                PRStatus.DRAFT.toLowerCase() ||
                pr.salesStatus?.toLowerCase() === "draft") && (
                <>
                  <Button
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    variant="outlined"
                  >
                    Edit
                  </Button>
                  <Button
                    startIcon={<SendIcon />}
                    onClick={handleSendToPA}
                    variant="contained"
                    disabled={sendToPAMutation.isPending}
                  >
                    Send to PA
                  </Button>
                  <Button
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                    variant="outlined"
                    color="error"
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </>
              )}
              {(pr.salesStatus?.toLowerCase() ===
                PRStatus.ACTION_REQUIRED.toLowerCase() ||
                pr.salesStatus?.toLowerCase() === "action required") && (
                <>
                  <Button
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    variant="outlined"
                  >
                    Edit
                  </Button>
                  <Button
                    startIcon={<SendIcon />}
                    onClick={handleEdit}
                    variant="contained"
                    color="primary"
                  >
                    Resubmit
                  </Button>
                </>
              )}
            </>
          )}

          {user?.role === UserRole.PRICING_ANALYST &&
            pr.assignedTo &&
            pr.assignedTo === user.id &&
            (pr.analystStatus?.toLowerCase() ===
              PRStatus.ACTIVE_STATUS.toLowerCase() ||
              pr.analystStatus?.toLowerCase() === "active status") && (
              <>
                <Button
                  startIcon={<ApproveIcon />}
                  onClick={() => handleAction("approve")}
                  variant="contained"
                  color="success"
                >
                  Approve
                </Button>
                <Button
                  startIcon={<RejectIcon />}
                  onClick={() => handleAction("reject")}
                  variant="contained"
                  color="error"
                >
                  Reject
                </Button>
                <Button
                  startIcon={<CommentIcon />}
                  onClick={() => handleAction("action_required")}
                  variant="outlined"
                  color="warning"
                >
                  Request Action
                </Button>
              </>
            )}

          {/* Show assigned user info if assigned to someone else */}
          {user?.role === UserRole.PRICING_ANALYST &&
            pr.assignedTo &&
            pr.assignedTo !== user.id && (
              <Chip
                label={`Assigned to: ${pr.assignedTo}`}
                color="info"
                variant="outlined"
                sx={{ fontSize: "0.875rem" }}
              />
            )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Header Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Header Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Shipment Date
                  </Typography>
                  <Typography variant="body1">
                    {safeFormatDate(pr.shipmentDate, "MMM dd, yyyy")}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Account Info
                  </Typography>
                  <Typography variant="body1">
                    {pr.accountInfo || "N/A"}
                  </Typography>
                </Grid>
                {pr.discount && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Discount
                    </Typography>
                    <Typography variant="body1">{pr.discount}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Daylight Protection
                  </Typography>
                  <Typography variant="body1">
                    {pr.daylightProtect ? "Yes" : "No"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Origin Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Origin Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Address
              </Typography>
              <Typography variant="body1" gutterBottom>
                {pr.originAddress || "N/A"}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {pr.originState || "N/A"}, {pr.originZip || "N/A"}
              </Typography>
              <Typography variant="body1">
                {pr.originCountry || "N/A"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Destination Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Destination Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Address
              </Typography>
              <Typography variant="body1" gutterBottom>
                {pr.destAddress || "N/A"}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {pr.destState || "N/A"}, {pr.destZip || "N/A"}
              </Typography>
              <Typography variant="body1">{pr.destCountry || "N/A"}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Services */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Additional Services
              </Typography>
              <Grid container spacing={2}>
                {pr.accessorial && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Accessorial
                    </Typography>
                    <Typography variant="body1">{pr.accessorial}</Typography>
                  </Grid>
                )}
                {pr.pickup && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Pickup
                    </Typography>
                    <Typography variant="body1">{pr.pickup}</Typography>
                  </Grid>
                )}
                {pr.delivery && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Delivery
                    </Typography>
                    <Typography variant="body1">{pr.delivery}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Items */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Items ({pr.items?.length || 0})
              </Typography>
              {pr.items && pr.items.length > 0 ? (
                <Grid container spacing={2}>
                  {pr.items.map((item, index) => (
                    <Grid item xs={12} md={6} key={item.id || index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {item.itemName || "N/A"}
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Commodity Class
                              </Typography>
                              <Typography variant="body2">
                                {item.commodityClass || "N/A"}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Total Weight
                              </Typography>
                              <Typography variant="body2">
                                {item.totalWeight || 0} lbs
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Handling Unit
                              </Typography>
                              <Typography variant="body2">
                                {item.handlingUnit || "N/A"}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Pieces
                              </Typography>
                              <Typography variant="body2">
                                {item.noOfPieces || 0}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Container Type
                              </Typography>
                              <Typography variant="body2">
                                {item.containerType || "N/A"}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Pallets
                              </Typography>
                              <Typography variant="body2">
                                {item.noOfPallets || 0}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No items available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Comments */}
        {pr.comments && pr.comments.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Comments ({pr.comments.length})
                </Typography>
                <List>
                  {pr.comments.map((comment) => (
                    <ListItem key={comment.id} divider>
                      <ListItemText
                        primary={comment.commentText || "N/A"}
                        secondary={safeFormatDate(
                          comment.createdAt,
                          "MMM dd, yyyy HH:mm"
                        )}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {user?.role === UserRole.SALES_EXECUTIVE
            ? pr.salesStatus?.toLowerCase() ===
                PRStatus.ACTION_REQUIRED.toLowerCase() ||
              pr.salesStatus?.toLowerCase() === "action required"
              ? "Resubmit PR"
              : "Edit PR"
            : pr.analystStatus?.toLowerCase() ===
                PRStatus.ACTION_REQUIRED.toLowerCase() ||
              pr.analystStatus?.toLowerCase() === "action required"
            ? "Resubmit PR"
            : "Edit PR"}
        </DialogTitle>
        <DialogContent>
          <PRForm
            initialData={pr}
            onSubmit={(data) => {
              if (user?.role === UserRole.SALES_EXECUTIVE) {
                if (
                  pr.salesStatus?.toLowerCase() ===
                    PRStatus.ACTION_REQUIRED.toLowerCase() ||
                  pr.salesStatus?.toLowerCase() === "action required"
                ) {
                  resubmitMutation.mutate(data);
                } else {
                  updateMutation.mutate(data);
                }
              } else {
                if (
                  pr.analystStatus?.toLowerCase() ===
                    PRStatus.ACTION_REQUIRED.toLowerCase() ||
                  pr.analystStatus?.toLowerCase() === "action required"
                ) {
                  resubmitMutation.mutate(data);
                } else {
                  updateMutation.mutate(data);
                }
              }
            }}
            onCancel={() => setIsEditDialogOpen(false)}
            isLoading={updateMutation.isPending || resubmitMutation.isPending}
            submitLabel={
              user?.role === UserRole.SALES_EXECUTIVE
                ? pr.salesStatus?.toLowerCase() ===
                    PRStatus.ACTION_REQUIRED.toLowerCase() ||
                  pr.salesStatus?.toLowerCase() === "action required"
                  ? "Resubmit"
                  : "Update"
                : pr.analystStatus?.toLowerCase() ===
                    PRStatus.ACTION_REQUIRED.toLowerCase() ||
                  pr.analystStatus?.toLowerCase() === "action required"
                ? "Resubmit"
                : "Update"
            }
          />
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog
        open={isActionDialogOpen}
        onClose={() => setIsActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionType === "approve"
            ? "Approve PR"
            : actionType === "reject"
            ? "Reject PR"
            : "Request Action"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            margin="normal"
            required={actionType !== "approve"}
            helperText={
              actionType === "approve" ? "Optional comment" : "Required comment"
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsActionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleActionSubmit}
            variant="contained"
            color={
              actionType === "approve"
                ? "success"
                : actionType === "reject"
                ? "error"
                : "warning"
            }
            disabled={
              (actionType !== "approve" && !comment.trim()) ||
              approveMutation.isPending ||
              rejectMutation.isPending ||
              actionRequiredMutation.isPending
            }
          >
            {actionType === "approve"
              ? "Approve"
              : actionType === "reject"
              ? "Reject"
              : "Request Action"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
