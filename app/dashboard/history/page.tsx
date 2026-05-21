'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Submission } from '@/types';

export default function HistoryPage() {
    const { user, intern, loading } = useAuth();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) router.replace('/login');
    }, [user, loading, router]);

    useEffect(() => {
        if (!intern) { setFetching(false); return; }
        fetch(`/api/admin/submissions?internId=${intern.id}`, { cache: 'no-store' })
            .then((r) => r.json())
            .then((data: Submission[]) => {
                setSubmissions([...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            })
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
                        <p className="text-sm text-slate-500">Your account is not registered in the system yet. Please ask the Admin to add your profile.</p>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="animate-fade-in">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-navy-900">Submission History</h1>
                    <p className="text-slate-500 mt-1">{submissions.length} total submission{submissions.length !== 1 ? 's' : ''}</p>
                </div>

                {submissions.length === 0 ? (
                    <Card className="text-center py-12">
                        <div className="text-4xl mb-3">📋</div>
                        <p className="text-navy-900 font-semibold">No submissions yet</p>
                        <p className="text-slate-400 text-sm mt-1">Start submitting your daily progress!</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {submissions.map((sub) => (
                            <Card key={sub.id} hover>
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-semibold text-navy-900">
                                                {new Date(sub.date).toLocaleDateString('en-IN', {
                                                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                                                })}
                                            </span>
                                            <Badge status={sub.workStatus} />
                                        </div>
                                        <p className="text-sm text-slate-700 font-medium truncate">{sub.assignedTask}</p>
                                        <p className="text-xs text-slate-400 mt-1">{sub.hoursContributed}</p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        {sub.uploadedFileUrl && (
                                            <a
                                                href={sub.uploadedFileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
                                                download
                                            >
                                                📎 {sub.uploadedFileName ?? 'File'}
                                            </a>
                                        )}
                                    </div>
                                </div>
                                {sub.workCompleted && (
                                    <p className="mt-3 text-sm text-slate-600 border-t border-slate-50 pt-3 line-clamp-2">
                                        {sub.workCompleted}
                                    </p>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
