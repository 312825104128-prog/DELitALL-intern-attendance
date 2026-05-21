'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Submission } from '@/types';

export default function AdminReportsPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [fetching, setFetching] = useState(true);
    const [search, setSearch] = useState('');
    const [domainFilter, setDomainFilter] = useState('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!loading && !user) router.replace('/login');
        if (!loading && user && !isAdmin) router.replace('/dashboard');
    }, [user, isAdmin, loading, router]);

    useEffect(() => {
        if (!isAdmin) return;
        fetch('/api/admin/submissions', { cache: 'no-store' })
            .then((r) => r.json())
            .then((data: unknown) => {
                const res = data as Submission[] | { error: string };
                if (res && 'error' in res) {
                    setErrorMsg(res.error);
                } else {
                    setSubmissions([...(res as Submission[])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                }
            })
            .catch(() => setErrorMsg('Failed to connect to backend'))
            .finally(() => setFetching(false));
    }, [isAdmin]);

    const domains = ['All', ...Array.from(new Set(submissions.map((s) => s.domain)))];

    const filtered = submissions.filter((s) => {
        const matchSearch =
            s.internName.toLowerCase().includes(search.toLowerCase()) ||
            s.internId.toLowerCase().includes(search.toLowerCase()) ||
            s.assignedTask.toLowerCase().includes(search.toLowerCase());
        const matchDomain = domainFilter === 'All' || s.domain === domainFilter;
        const matchFrom = !dateFrom || s.date >= dateFrom;
        const matchTo = !dateTo || s.date <= dateTo;
        return matchSearch && matchDomain && matchFrom && matchTo;
    });

    if (loading || fetching) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-64">
                    <div className="w-8 h-8 border-2 border-navy-900/20 border-t-navy-900 rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    if (errorMsg) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-64">
                    <Card className="text-center p-8 max-w-md w-full">
                        <div className="text-3xl mb-3">⚠️</div>
                        <p className="text-red-600 font-semibold mb-2">API Connection Error</p>
                        <p className="text-sm text-slate-500">{errorMsg}</p>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="animate-fade-in space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900">Submission Reports</h1>
                    <p className="text-slate-500 mt-1">{filtered.length} of {submissions.length} submissions</p>
                </div>

                {/* Filters */}
                <Card>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <input
                            type="text"
                            placeholder="Search intern or task…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                        <select
                            value={domainFilter}
                            onChange={(e) => setDomainFilter(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-white"
                        >
                            {domains.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            placeholder="From date"
                        />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            placeholder="To date"
                        />
                    </div>
                </Card>

                {/* Submissions table */}
                <Card>
                    {filtered.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="text-3xl mb-2">📋</div>
                            <p className="text-slate-400 text-sm">No submissions match your filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        {['Date', 'Intern', 'ID', 'Domain', 'Task', 'Status', 'Hours', 'File'].map((h) => (
                                            <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filtered.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                                                {new Date(sub.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                            </td>
                                            <td className="py-3 px-3 font-medium text-navy-900 whitespace-nowrap">{sub.internName}</td>
                                            <td className="py-3 px-3 font-mono text-xs text-cyan-700">{sub.internId}</td>
                                            <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{sub.domain}</td>
                                            <td className="py-3 px-3 text-slate-600 max-w-48 truncate">{sub.assignedTask}</td>
                                            <td className="py-3 px-3"><Badge status={sub.workStatus} /></td>
                                            <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{sub.hoursContributed}</td>
                                            <td className="py-3 px-3">
                                                {sub.uploadedFileUrl ? (
                                                    <a
                                                        href={sub.uploadedFileUrl}
                                                        download
                                                        className="text-xs text-cyan-600 hover:text-cyan-700 font-medium whitespace-nowrap"
                                                    >
                                                        📎 View
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-300">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* Expandable details */}
                {filtered.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Detailed View</h3>
                        {filtered.slice(0, 20).map((sub) => (
                            <Card key={`detail-${sub.id}`} className="text-sm">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <span className="font-semibold text-navy-900">{sub.internName}</span>
                                    <span className="text-slate-400">{sub.internId}</span>
                                    <Badge status={sub.workStatus} />
                                    <span className="text-slate-400 ml-auto">{new Date(sub.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Task</p>
                                        <p className="text-slate-700">{sub.assignedTask}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Learning</p>
                                        <p className="text-slate-700">{sub.learningDetails}</p>
                                    </div>
                                    {sub.workCompleted && (
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Work Done</p>
                                            <p className="text-slate-700">{sub.workCompleted}</p>
                                        </div>
                                    )}
                                    {sub.challengesFaced && (
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Challenges</p>
                                            <p className="text-slate-700">{sub.challengesFaced}</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
