import { z } from 'zod';
import { UserRole, PRStatus } from '../types';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().refine((val) => val === UserRole.SALES_EXECUTIVE || val === UserRole.PRICING_ANALYST, {
    message: 'Please select a valid role'
  })
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const itemInfoSchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  commodityClass: z.string().min(1, 'Commodity class is required'),
  totalWeight: z.number().positive('Total weight must be positive'),
  handlingUnits: z.number().int().positive('Handling units must be a positive integer'),
  numberOfPieces: z.number().int().positive('Number of pieces must be a positive integer'),
  containerTypes: z.string().min(1, 'Container types is required'),
  numberOfPallets: z.number().int().min(0, 'Number of pallets must be non-negative')
});

export const prFormSchema = z.object({
  // Header Section
  shipmentDate: z.date({
    required_error: 'Shipment date is required'
  }),
  accountInfo: z.string().min(1, 'Account info is required'),
  discount: z.number().min(0, 'Discount must be non-negative').max(100, 'Discount cannot exceed 100%'),
  
  // Origin Section
  startingAddress: z.string().min(1, 'Starting address is required'),
  startingState: z.string().min(1, 'Starting state is required'),
  startingZip: z.string().min(1, 'Starting zip is required'),
  startingCountry: z.string().min(1, 'Starting country is required'),
  
  // Destination Section
  destinationAddress: z.string().min(1, 'Destination address is required'),
  destinationState: z.string().min(1, 'Destination state is required'),
  destinationZip: z.string().min(1, 'Destination zip is required'),
  destinationCountry: z.string().min(1, 'Destination country is required'),
  
  // Item Info
  items: z.array(itemInfoSchema).min(1, 'At least one item is required'),
  
  // Additional Services
  accessorial: z.boolean(),
  pickup: z.boolean(),
  delivery: z.boolean(),
  
  // Insurance
  daylightProtectCoverage: z.boolean(),
  insuranceDescription: z.string().optional(),
  insuranceNote: z.string().optional()
});

export const commentSchema = z.object({
  comment_text: z.string().min(1, 'Comment text is required')
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type PRFormData = z.infer<typeof prFormSchema>;
export type CommentFormData = z.infer<typeof commentSchema>; 