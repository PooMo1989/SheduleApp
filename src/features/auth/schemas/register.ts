import { z } from 'zod';

/**
 * Password validation with security requirements
 * Story 3.8: Admin/Provider Strict Authentication
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 */
const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter');

/**
 * Registration form validation schema
 * Used for both client-side and server-side validation
 */
export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: passwordSchema,
    fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Client-side registration form schema with confirm password
 */
export const registerFormSchema = registerSchema.extend({
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export type RegisterFormInput = z.infer<typeof registerFormSchema>;
