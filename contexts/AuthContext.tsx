'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { Intern } from '@/types';

interface AuthContextValue {
    user: User | null;
    intern: Intern | null;
    isAdmin: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    intern: null,
    isAdmin: false,
    loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [intern, setIntern] = useState<Intern | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                try {
                    const res = await fetch(`/api/intern?uid=${firebaseUser.uid}`, { cache: 'no-store' });
                    if (res.ok) {
                        const data: Intern = await res.json();
                        setIntern(data);
                    } else {
                        setIntern(null);
                    }
                } catch {
                    setIntern(null);
                }
            } else {
                setIntern(null);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const isAdmin =
        user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
        intern?.isAdmin === true;

    return (
        <AuthContext.Provider value={{ user, intern, isAdmin, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
