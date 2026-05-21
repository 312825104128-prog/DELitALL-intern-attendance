'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Submission } from '@/types';

export default function ProgressPage() {
    const { user, intern, loading } = useAuth();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) router.replace('/login');
    }, [user, loading, router]);

    useEffect(() => {
        if (!intern) { setFetching(false); return; }
        fetch(`/api/admin/submissions?internId=${intern.id}`)
            .then((r) => r.json())
            .then((data: Submission[]) => setSubmissions(data))
            .finally(() => setFetching(false));
    }, [intern]);

    if (loading || fetching) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-64">
                    <div className="w-8 h-8 border-2 border-navy-900/20 border-t-navy-900 rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    if (!intern) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-64">
                    <Card className="text-center p-8 max-w-md w-full">
                        <div className="text-3xl mb-3">⚠️</div>
                        <p className="text-red-600 font-semibold mb-2">Profile Not Found</p>
                        <p className="text-sm text-slate-500">Your account is not registered yet. Please ask the Admin to add your profile.</p>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    const totalDays = Math.max(1, Math.round(
        (new Date(intern.endDate).getTime() - new Date(intern.startDate).getTime()) / (1000 * 60 * 60 * 24)
    ));
    const daysElapsed = Math.max(0, Math.min(totalDays, Math.round(
        (Date.now() - new Date(intern.startDate).getTime()) / (1000 * 60 * 60 * 24)
    )));
    const submissionRate = daysElapsed > 0 ? Math.round((submissions.length / daysElapsed) * 100) : 0;
    const statusCounts = submissions.reduce((acc, s) => {
        acc[s.workStatus] = (acc[s.workStatus] ?? 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <DashboardLayout>
            <div className="animate-fade-in">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-navy-900">My Progress</h1>
                    <p className="text-slate-500 mt-1">{intern.domain} — {intern.role}</p>
                </div>

                {/* Progress section */}
                <Card className="mb-6">
                    <h3 className="text-base font-semibold text-navy-900 mb-6">Internship Timeline</h3>
                    <ProgressBar startDate={intern.startDate} endDate={intern.endDate} />
                </Card>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total Submissions', value: submissions.length, emoji: '📋' },
                        { label: 'Submission Rate', value: `${submissionRate}%`, emoji: '📊' },
                        { label: 'Completed Tasks', value: statusCounts['Completed'] ?? 0, emoji: '✅' },
                        { label: 'Days Remaining', value: Math.max(0, totalDays - daysElapsed), emoji: '⏳' },
                    ].map(({ label, value, emoji }) => (
                        <Card key={label} className="text-center">
                            <div className="text-2xl mb-2">{emoji}</div>
                            <p className="text-2xl font-bold text-navy-900">{value}</p>
                            <p className="text-xs text-slate-400 mt-1">{label}</p>
                        </Card>
                    ))}
                </div>

                {/* Status breakdown */}
                <Card>
                    <h3 className="text-base font-semibold text-navy-900 mb-4">Work Status Breakdown</h3>
                    {submissions.length === 0 ? (
                        <p className="text-slate-400 text-sm">No submissions yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {[
                                { label: 'Completed', color: 'bg-emerald-500', count: statusCounts['Completed'] ?? 0 },
                                { label: 'In Progress', color: 'bg-amber-500', count: statusCounts['In Progress'] ?? 0 },
                                { label: 'Blocked', color: 'bg-red-500', count: statusCounts['Blocked'] ?? 0 },
                            ].map(({ label, color, count }) => {
                                const pct = submissions.length > 0 ? Math.round((count / submissions.length) * 100) : 0;
                                return (
                                    <div key={label}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-600 font-medium">{label}</span>
                                            <span className="text-slate-400">{count} ({pct}%)</span>
                                        </div>
                                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${color} transition-all duration-500`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}
