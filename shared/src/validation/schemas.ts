import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
});

export const quoteRequestSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  city: z.string().min(2, 'City is required'),
  occupation: z.string().optional(),
  income: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().nonnegative().optional()),
  insuranceType: z.string().min(2, 'Insurance type is required'),
  coverageRequired: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().positive().optional()),
  preferredContactTime: z.string().optional(),
  notes: z.string().optional(),
});

export const appointmentBookSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  type: z.enum(['PHONE', 'VIDEO', 'OFFICE', 'HOME']),
  date: z.string().min(1, 'Date is required'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  purpose: z.string().min(2, 'Purpose is required'),
  notes: z.string().optional(),
});

export const premiumCalculateSchema = z.object({
  policyName: z.string().min(1, 'Policy selection is required'),
  age: z.preprocess((val) => Number(val), z.number().min(18, 'Age must be at least 18').max(100, 'Age must be less than 100')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  smoker: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
  occupation: z.string().min(2, 'Occupation is required'),
  income: z.preprocess((val) => Number(val), z.number().min(0, 'Income must be non-negative')),
  coverage: z.preprocess((val) => Number(val), z.number().min(100000, 'Minimum coverage is 1,000,000')),
  policyDuration: z.preprocess((val) => Number(val), z.number().min(5, 'Minimum policy duration is 5 years').max(50, 'Maximum is 50 years')),
  dependents: z.preprocess((val) => Number(val), z.number().min(0, 'Cannot be negative')),
});

export const needsAnalysisSchema = z.object({
  age: z.preprocess((val) => Number(val), z.number().min(18).max(100)),
  maritalStatus: z.string().min(1, 'Marital status is required'),
  children: z.preprocess((val) => Number(val), z.number().min(0)),
  occupation: z.string().min(1, 'Occupation is required'),
  income: z.preprocess((val) => Number(val), z.number().min(0)),
  existingInsurance: z.string().optional(),
  loans: z.preprocess((val) => Number(val), z.number().min(0)),
  financialGoals: z.array(z.string()).min(1, 'Select at least one financial goal'),
  riskAppetite: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  futurePlans: z.string().optional(),
  emergencySavings: z.preprocess((val) => Number(val), z.number().min(0)),
});

export const blogCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  category: z.enum(['INSURANCE', 'FINANCE', 'HEALTH', 'INVESTMENT', 'RETIREMENT', 'TAX_SAVING']),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED']),
  publishedAt: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});
