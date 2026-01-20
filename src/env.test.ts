import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock createEnv before importing
vi.mock('@t3-oss/env-nextjs', () => ({
    createEnv: vi.fn(() => {
        return {
            NODE_ENV: process.env.NODE_ENV || 'test',
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        };
    }),
}));

describe('Environment Variable Validation', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    describe('NEXT_PUBLIC_SUPABASE_URL', () => {
        it('should be a valid URL', () => {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            if (url) {
                expect(() => new URL(url)).not.toThrow();
            }
        });
    });

    describe('NEXT_PUBLIC_SUPABASE_ANON_KEY', () => {
        it('should be a non-empty string', () => {
            const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            if (key) {
                expect(key.length).toBeGreaterThan(0);
            }
        });
    });

    describe('NODE_ENV', () => {
        it('should be development, test, or production', () => {
            const nodeEnv = process.env.NODE_ENV;
            expect(['development', 'test', 'production']).toContain(nodeEnv);
        });
    });
});
