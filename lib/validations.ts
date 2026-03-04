import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

export const applicationSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be under 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name contains invalid characters'),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email too long')
    .toLowerCase(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number format'),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address too long'),
  income: z
    .number({ invalid_type_error: 'Income must be a number' })
    .min(0, 'Income cannot be negative')
    .max(10000000, 'Income value too large'),
  amount_requested: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(1000, 'Minimum scholarship amount is ₹1,000')
    .max(500000, 'Maximum scholarship amount is ₹5,00,000'),
  reason: z
    .string()
    .min(50, 'Please provide at least 50 characters explaining your need')
    .max(2000, 'Reason must be under 2000 characters'),
  declaration: z
    .boolean()
    .refine((val) => val === true, 'You must accept the declaration'),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export function validateFileType(mimeType: string): boolean {
  return ACCEPTED_FILE_TYPES.includes(mimeType);
}

export function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

// Server-side sanitization
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // strip basic HTML brackets
    .substring(0, 5000);  // hard cap
}

// Score applicant based on income and amount requested
export function calculateScore(income: number, amountRequested: number): number {
  let score = 0;
  // Lower income = higher score (max 60 pts)
  if (income < 100000) score += 60;
  else if (income < 250000) score += 45;
  else if (income < 500000) score += 30;
  else if (income < 800000) score += 15;
  else score += 5;

  // Lower amount requested relative to income = higher score (max 40 pts)
  const ratio = amountRequested / Math.max(income, 1);
  if (ratio < 0.1) score += 40;
  else if (ratio < 0.25) score += 30;
  else if (ratio < 0.5) score += 20;
  else if (ratio < 1) score += 10;

  return Math.min(score, 100);
}
