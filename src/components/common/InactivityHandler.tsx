'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function InactivityHandler() {
    const router = useRouter();
    const supabase = createClient();
    const timeoutRef = useRef<NodeJS.Timeout>(undefined);

    useEffect(() => {
        // Only set timeout if user is logged in? 
        // This runs on client side, so we can verify session or just run it. 
        // Ideally we'd check session, but supabase.auth.signOut() is safe if not logged in.

        const resetTimer = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(async () => {
                await supabase.auth.signOut();
                router.push('/login?reason=inactivity');
            }, INACTIVITY_TIMEOUT);
        };

        // Events that reset the timer
        const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
        events.forEach((event) => {
            window.addEventListener(event, resetTimer);
        });

        // Initial timer
        resetTimer();

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [router, supabase]);

    return null;
}
