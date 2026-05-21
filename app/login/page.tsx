'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.replace('/');
        } catch (err: unknown) {
            const code = (err as { code?: string }).code ?? '';
            if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
                setError('Invalid credentials. Check your email/ID and password.');
            } else if (code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Please try again later.');
            } else if (code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetLoading(true);
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setResetSent(true);
        } catch {
            setError('Could not send reset email. Make sure the email is correct.');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
            {/* Background pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-navy-900/3 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl" />
            </div>

            <div className="w-full max-w-md relative">
                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    {/* Top accent bar */}
                    <div className="h-1 bg-gradient-to-r from-navy-900 via-navy-700 to-cyan-500" />

                    <div className="px-8 py-10">
                        {/* Logo area */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative w-16 h-16 mb-3">
                                <Image
                                    src="/logo.png"
                                    alt="DELitALL"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <h1 className="text-2xl font-bold text-navy-900">DELitALL</h1>
                            <p className="text-sm text-slate-400 mt-1">Internship Portal</p>
                        </div>

                        {!showReset ? (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-navy-900">Welcome back</h2>
                                    <p className="text-sm text-slate-500 mt-1">Sign in with your intern credentials</p>
                                </div>

                                {error && (
                                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleLogin} className="space-y-4">
                                    <Input
                                        id="email"
                                        label="Email / Intern ID"
                                        type="email"
                                        placeholder="you@delitall.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                    <Input
                                        id="password"
                                        label="Password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => { setShowReset(true); setError(''); }}
                                            className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>

                                    <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
                                        Sign In
                                    </Button>
                                </form>

                                <p className="text-center text-xs text-slate-400 mt-6">
                                    Don&apos;t have credentials? Contact your admin.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-navy-900">Reset Password</h2>
                                    <p className="text-sm text-slate-500 mt-1">We&apos;ll send a reset link to your email</p>
                                </div>

                                {resetSent ? (
                                    <div className="px-4 py-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                                        <p className="text-sm text-emerald-700 font-medium">✓ Reset link sent!</p>
                                        <p className="text-xs text-emerald-600 mt-1">Check your inbox and spam folder.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleReset} className="space-y-4">
                                        {error && (
                                            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                                                <p className="text-sm text-red-600">{error}</p>
                                            </div>
                                        )}
                                        <Input
                                            id="resetEmail"
                                            label="Email address"
                                            type="email"
                                            placeholder="you@delitall.com"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            required
                                        />
                                        <Button type="submit" loading={resetLoading} size="lg" className="w-full">
                                            Send Reset Link
                                        </Button>
                                    </form>
                                )}

                                <button
                                    onClick={() => { setShowReset(false); setResetSent(false); setError(''); }}
                                    className="mt-4 text-sm text-slate-500 hover:text-navy-900 flex items-center gap-1 mx-auto"
                                >
                                    ← Back to login
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">
                    © 2025 DELitALL. All rights reserved.
                </p>
            </div>
        </div>
    );
}
