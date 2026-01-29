import { describe, it, expect } from 'vitest';
import { registerSchema, registerFormSchema } from './register';

describe('registerSchema', () => {
    describe('email validation', () => {
        it('accepts valid email addresses', () => {
            const result = registerSchema.safeParse({
                email: 'user@example.com',
                phone: '1234567890',
                password: 'Password123',
            });
            expect(result.success).toBe(true);
        });

        it('rejects invalid email addresses', () => {
            const result = registerSchema.safeParse({
                email: 'not-an-email',
                phone: '1234567890',
                password: 'Password123',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Invalid email address');
            }
        });

        it('rejects empty email', () => {
            const result = registerSchema.safeParse({
                email: '',
                phone: '1234567890',
                password: 'Password123',
            });
            expect(result.success).toBe(false);
        });
    });

    describe('phone validation', () => {
        it('accepts phone numbers with 10+ digits', () => {
            const result = registerSchema.safeParse({
                email: 'user@example.com',
                phone: '1234567890',
                password: 'Password123',
            });
            expect(result.success).toBe(true);
        });

        it('rejects phone numbers with less than 10 digits', () => {
            const result = registerSchema.safeParse({
                email: 'user@example.com',
                phone: '123456789',
                password: 'Password123',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Phone number must be at least 10 digits');
            }
        });
    });

    describe('password validation', () => {
        it('accepts passwords with 8+ characters', () => {
            const result = registerSchema.safeParse({
                email: 'user@example.com',
                phone: '1234567890',
                password: 'Password1',
            });
            expect(result.success).toBe(true);
        });

        it('rejects passwords with less than 8 characters', () => {
            const result = registerSchema.safeParse({
                email: 'user@example.com',
                phone: '1234567890',
                password: 'Pass123',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Password must be at least 8 characters');
            }
        });
    });

    describe('fullName validation', () => {
        it('accepts optional fullName', () => {
            const result = registerSchema.safeParse({
                email: 'user@example.com',
                phone: '1234567890',
                password: 'Password123',
            });
            expect(result.success).toBe(true);
        });

        it('accepts fullName with 2+ characters', () => {
            const result = registerSchema.safeParse({
                email: 'user@example.com',
                phone: '1234567890',
                password: 'Password123',
                fullName: 'John Doe',
            });
            expect(result.success).toBe(true);
        });

        it('rejects fullName with less than 2 characters', () => {
            const result = registerSchema.safeParse({
                email: 'user@example.com',
                phone: '1234567890',
                password: 'Password123',
                fullName: 'J',
            });
            expect(result.success).toBe(false);
        });
    });
});

describe('registerFormSchema', () => {
    describe('password confirmation', () => {
        it('accepts matching passwords', () => {
            const result = registerFormSchema.safeParse({
                email: 'user@example.com',
                phone: '1234567890',
                password: 'Password123',
                confirmPassword: 'Password123',
            });
            expect(result.success).toBe(true);
        });

        it('rejects non-matching passwords', () => {
            const result = registerFormSchema.safeParse({
                email: 'user@example.com',
                phone: '1234567890',
                password: 'Password123',
                confirmPassword: 'Different123',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("Passwords don't match");
            }
        });
    });
});
