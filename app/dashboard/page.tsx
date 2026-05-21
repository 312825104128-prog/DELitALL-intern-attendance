'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
    const { user, intern, loading } = useAuth();
    const router = useRouter();
    const [submitted, setSubmitted] = useState<boolean | null>(null);

    useEffect(() => {
        if (!loading && !user) router.replace('/login');
    }, [user, loading, router]);

    useEffect(() => {
        if (!intern) return;
        const today = new Date().toISOString().split('T')[0];
        fetch(`/api/check-submission?internId=${intern.id}&date=${today}`, { cache: 'no-store' })
            .then((r) => r.json())
            .then((d) => setSubmitted(d.submitted));
    }, [intern]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-2 border-navy-900/20 border-t-navy-900 rounded-full animate-spin" />
            </div>
        );
    }

    if (!intern) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-64">
                    <Card className="text-center p-8 max-w-md w-full">
                        <div className="text-3xl mb-3">⚠️</div>
                        <p className="text-red-600 font-semibold mb-2">Profile Not Found</p>
                        <p className="text-sm text-slate-500">
                            Your account is not registered in the system yet. Please ask the Admin to add your profile at /admin/interns.
                        </p>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-sm text-slate-400">{today}</p>
                        <h1 className="text-2xl font-bold text-navy-900 mt-1">
                            Welcome back, {intern.name.split(' ')[0]} 👋
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">{intern.domain}</p>
                    </div>
                    {submitted === false && (
                        <Button onClick={() => router.push('/dashboard/submit')}>
                            Submit Today&apos;s Progress
                        </Button>
                    )}
                </div>

                {/* Submission status banner */}
                {submitted !== null && (
                    <div className={`px-5 py-4 rounded-2xl border flex items-center gap-3 ${submitted
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-amber-50 border-amber-200'
                        }`}>
                        <span className="text-xl">{submitted ? '✅' : '⏳'}</span>
                        <div>
                            <p className={`text-sm font-semibold ${submitted ? 'text-emerald-800' : 'text-amber-800'}`}>
                                {submitted
                                    ? "Today's submission is complete!"
                                    : "You haven't submitted today's progress yet"}
                            </p>
                            <p className={`text-xs mt-0.5 ${submitted ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {submitted
                                    ? 'Great work! Keep it up.'
                                    : 'Deadline: End of day. Click "Submit Today\'s Progress" above.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Profile + Progress row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Intern Profile Card */}
                    <Card>
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-14 h-14 rounded-2xl bg-navy-900 flex items-center justify-center text-white text-xl font-bold">
                                {intern.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-navy-900">{intern.name}</h2>
                                <p className="text-sm text-cyan-600 font-medium">{intern.id}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Role', value: intern.role },
                                { label: 'Domain', value: intern.domain },
                                { label: 'Email', value: intern.email },
                                {
                                    label: 'Start Date',
                                    value: new Date(intern.startDate).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'long', year: 'numeric',
                                    }),
                                },
                                {
                                    label: 'End Date',
                                    value: new Date(intern.endDate).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'long', year: 'numeric',
                                    }),
                                },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</span>
                                    <span className="text-sm text-navy-900 font-medium">{value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Progress Card */}
                    <Card>
                        <h3 className="text-lg font-bold text-navy-900 mb-2">Internship Progress</h3>
                        <p className="text-sm text-slate-500 mb-6">Your journey so far</p>
                        <ProgressBar startDate={intern.startDate} endDate={intern.endDate} />
                        <div className="mt-6 grid grid-cols-3 gap-3">
                            {[
                                {
                                    label: 'Total Days',
                                    value: Math.round(
                                        (new Date(intern.endDate).getTime() - new Date(intern.startDate).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    ),
                                },
                                {
                                    label: 'Completed',
                                    value: Math.max(
                                        0,
                                        Math.min(
                                            Math.round(
                                                (new Date(intern.endDate).getTime() - new Date(intern.startDate).getTime()) /
                                                (1000 * 60 * 60 * 24)
                                            ),
                                            Math.round((Date.now() - new Date(intern.startDate).getTime()) / (1000 * 60 * 60 * 24))
                                        )
                                    ),
                                },
                                {
                                    label: 'Remaining',
                                    value: Math.max(
                                        0,
                                        Math.round((new Date(intern.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                                    ),
                                },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-bold text-navy-900">{value}</p>
                                    <p className="text-xs text-slate-400 mt-1">{label}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Daily Submission', desc: 'Log today\'s work', href: '/dashboard/submit', emoji: '📋' },
                        { label: 'My Progress', desc: 'Track your growth', href: '/dashboard/progress', emoji: '📈' },
                        { label: 'History', desc: 'Past submissions', href: '/dashboard/history', emoji: '🗂️' },
                    ].map((item) => (
                        <Card key={item.href} hover className="cursor-pointer" >
                            <button onClick={() => router.push(item.href)} className="w-full text-left">
                                <span className="text-3xl">{item.emoji}</span>
                                <h3 className="text-base font-semibold text-navy-900 mt-3">{item.label}</h3>
                                <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                            </button>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
