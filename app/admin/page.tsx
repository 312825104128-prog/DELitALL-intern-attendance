'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Submission, Intern } from '@/types';

interface AdminData {
    totalInterns: number;
    submissionsToday: number;
    missingToday: number;
    totalSubmissions: number;
    domainBreakdown: Record<string, number>;
    recentActivity: Submission[];
    interns: Intern[];
    today: string;
}

export default function AdminDashboardPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<AdminData | null>(null);
    const [fetching, setFetching] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!loading && !user) router.replace('/login');
        if (!loading && user && !isAdmin) router.replace('/dashboard');
    }, [user, isAdmin, loading, router]);

    useEffect(() => {
        if (!isAdmin) return;
        fetch('/api/admin/stats', { cache: 'no-store' })
            .then((r) => r.json())
            .then((d) => {
                if (d.error) setErrorMsg(d.error);
                else setData(d);
            })
            .catch(() => setErrorMsg('Failed to connect to backend'))
            .finally(() => setFetching(false));
    }, [isAdmin]);

    if (loading || fetching) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-64">
                    <div className="w-8 h-8 border-2 border-navy-900/20 border-t-navy-900 rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    if (errorMsg || !data) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-64">
                    <Card className="text-center p-8 max-w-md w-full">
                        <div className="text-3xl mb-3">⚠️</div>
                        <p className="text-red-600 font-semibold mb-2">API Connection Error</p>
                        <p className="text-sm text-slate-500">{errorMsg || 'Failed to load stats.'}</p>
                        <p className="text-xs text-slate-400 mt-4">Please check your Google Sheets API credentials in .env.local</p>
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
            <div className="animate-fade-in space-y-6">
                {/* Header */}
                <div>
                    <p className="text-sm text-slate-400">{today}</p>
                    <h1 className="text-2xl font-bold text-navy-900 mt-1">Admin Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">DELitALL Internship Overview</p>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Interns', value: data.totalInterns, emoji: '👥', color: 'text-navy-900' },
                        { label: "Today's Submissions", value: data.submissionsToday, emoji: '📋', color: 'text-emerald-600' },
                        { label: 'Missing Today', value: data.missingToday, emoji: '⚠️', color: 'text-amber-600' },
                        { label: 'All Submissions', value: data.totalSubmissions, emoji: '📊', color: 'text-cyan-600' },
                    ].map(({ label, value, emoji, color }) => (
                        <Card key={label} className="text-center">
                            <div className="text-2xl mb-2">{emoji}</div>
                            <p className={`text-3xl font-bold ${color}`}>{value}</p>
                            <p className="text-xs text-slate-400 mt-1">{label}</p>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Domain breakdown */}
                    <Card>
                        <h3 className="text-base font-semibold text-navy-900 mb-4">Domain Breakdown</h3>
                        {Object.entries(data.domainBreakdown).length === 0 ? (
                            <p className="text-slate-400 text-sm">No interns yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {Object.entries(data.domainBreakdown).map(([domain, count]) => (
                                    <div key={domain} className="flex items-center justify-between">
                                        <span className="text-sm text-slate-700">{domain}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 bg-navy-900 rounded-full" style={{ width: `${count * 16}px`, minWidth: 8 }} />
                                            <span className="text-sm font-semibold text-navy-900">{count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Missing interns today */}
                    <Card>
                        <h3 className="text-base font-semibold text-navy-900 mb-4">Missing Submissions Today</h3>
                        {data.missingToday === 0 ? (
                            <div className="text-center py-4">
                                <div className="text-3xl mb-2">🎉</div>
                                <p className="text-sm text-emerald-700 font-medium">All interns submitted today!</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {data.interns
                                    .filter((intern) => !data.recentActivity.some(
                                        (s) => s.internId === intern.id && s.date === data.today
                                    ))
                                    .slice(0, 8)
                                    .map((intern) => (
                                        <div key={intern.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium text-navy-900">{intern.name}</p>
                                                <p className="text-xs text-slate-400">{intern.id} · {intern.domain}</p>
                                            </div>
                                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                                        </div>
                                    ))}
                                {data.missingToday > 8 && (
                                    <p className="text-xs text-slate-400 text-center pt-1">+{data.missingToday - 8} more</p>
                                )}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Recent activity */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-navy-900">Recent Submissions</h3>
                        <button
                            onClick={() => router.push('/admin/reports')}
                            className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                        >
                            View all →
                        </button>
                    </div>
                    {data.recentActivity.length === 0 ? (
                        <p className="text-slate-400 text-sm">No submissions yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        {['Intern', 'Domain', 'Date', 'Status', 'Hours'].map((h) => (
                                            <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {data.recentActivity.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-3 font-medium text-navy-900">{sub.internName}</td>
                                            <td className="py-3 px-3 text-slate-500">{sub.domain}</td>
                                            <td className="py-3 px-3 text-slate-500">{new Date(sub.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                            <td className="py-3 px-3"><Badge status={sub.workStatus} /></td>
                                            <td className="py-3 px-3 text-slate-500">{sub.hoursContributed}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}
