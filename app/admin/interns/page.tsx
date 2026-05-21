'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Intern, Domain } from '@/types';

const DOMAIN_OPTIONS: Domain[] = [
    'Web Development', 'Marketing', 'QA Testing', 'UI/UX', 'Data Science', 'Mobile Development', 'DevOps', 'Other',
];

const EMPTY_INTERN: Omit<Intern, 'id' | 'uid'> = {
    name: '', email: '', domain: 'Web Development', startDate: '', endDate: '', role: '', isAdmin: false,
};

export default function AdminInternsPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [interns, setInterns] = useState<Intern[]>([]);
    const [fetching, setFetching] = useState(true);
    const [search, setSearch] = useState('');
    const [domainFilter, setDomainFilter] = useState('All');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<Omit<Intern, 'id' | 'uid'>>({ ...EMPTY_INTERN });
    const [internUid, setInternUid] = useState('');
    const [internId, setInternId] = useState('');
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [fetchError, setFetchError] = useState('');

    useEffect(() => {
        if (!loading && !user) router.replace('/login');
        if (!loading && user && !isAdmin) router.replace('/dashboard');
    }, [user, isAdmin, loading, router]);

    const loadInterns = () => {
        setFetching(true);
        setFetchError('');
        fetch('/api/admin/interns', { cache: 'no-store' })
            .then((r) => r.json())
            .then((d) => {
                if (d.error) setFetchError(d.error);
                else setInterns(d);
            })
            .catch(() => setFetchError('Failed to connect to backend'))
            .finally(() => setFetching(false));
    };

    useEffect(() => { if (isAdmin) loadInterns(); }, [isAdmin]);

    const filtered = interns.filter((i) => {
        const matchSearch =
            i.name.toLowerCase().includes(search.toLowerCase()) ||
            i.id.toLowerCase().includes(search.toLowerCase()) ||
            i.email.toLowerCase().includes(search.toLowerCase());
        const matchDomain = domainFilter === 'All' || i.domain === domainFilter;
        return matchSearch && matchDomain;
    });

    const handleSave = async () => {
        if (!formData.name || !formData.email || !internUid || !internId) {
            setFormError('Name, Email, Firebase UID, and Intern ID are required.');
            return;
        }
        setSaving(true);
        setFormError('');
        try {
            const res = await fetch('/api/admin/interns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, uid: internUid, id: internId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setShowForm(false);
            setFormData({ ...EMPTY_INTERN });
            setInternUid('');
            setInternId('');
            loadInterns();
        } catch (err: unknown) {
            setFormError((err as Error).message ?? 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (uid: string, name: string) => {
        if (!confirm(`Remove ${name} from the portal? Their submission data will be kept.`)) return;
        await fetch(`/api/admin/interns?uid=${uid}`, { method: 'DELETE' });
        loadInterns();
    };

    const generateId = () => {
        const count = interns.filter((i) => !i.isAdmin).length + 1;
        return `DEL-INT-${String(count).padStart(3, '0')}`;
    };

    if (loading || fetching) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-64">
                    <div className="w-8 h-8 border-2 border-navy-900/20 border-t-navy-900 rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    if (fetchError) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-64">
                    <Card className="text-center p-8 max-w-md w-full">
                        <div className="text-3xl mb-3">⚠️</div>
                        <p className="text-red-600 font-semibold mb-2">API Connection Error</p>
                        <p className="text-sm text-slate-500">{fetchError}</p>
                        <p className="text-xs text-slate-400 mt-4">Please check your local data directory or restart the server.</p>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="animate-fade-in space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-navy-900">Interns</h1>
                        <p className="text-slate-500 mt-1">{interns.filter((i) => !i.isAdmin).length} registered interns</p>
                    </div>
                    <Button onClick={() => { setShowForm(true); setInternId(generateId()); }}>
                        + Add Intern
                    </Button>
                </div>

                {/* Add intern form */}
                {showForm && (
                    <Card className="border-2 border-navy-200">
                        <h3 className="text-base font-semibold text-navy-900 mb-4">Register New Intern</h3>
                        <p className="text-xs text-slate-400 mb-4 bg-slate-50 rounded-lg p-3">
                            ⓘ First create the intern&apos;s account in <strong>Firebase Console → Authentication → Add User</strong>, then fill in the details below with the Firebase UID provided.
                        </p>
                        {formError && (
                            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{formError}</p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <Input id="fuid" label="Firebase UID *" placeholder="From Firebase Console" value={internUid} onChange={(e) => setInternUid(e.target.value)} />
                            <Input id="fid" label="Intern ID *" placeholder="e.g. DEL-INT-001" value={internId} onChange={(e) => setInternId(e.target.value)} />
                            <Input id="fname" label="Full Name *" placeholder="Arjun Sharma" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            <Input id="femail" label="Email *" type="email" placeholder="arjun@delitall.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            <Input id="frole" label="Role / Position" placeholder="Web Development Intern" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-700">Domain</label>
                                <select
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                    value={formData.domain}
                                    onChange={(e) => setFormData({ ...formData, domain: e.target.value as Domain })}
                                >
                                    {DOMAIN_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <Input id="fstart" label="Start Date" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                            <Input id="fend" label="End Date" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={handleSave} loading={saving}>Save Intern</Button>
                            <Button variant="secondary" onClick={() => { setShowForm(false); setFormError(''); }}>Cancel</Button>
                        </div>
                    </Card>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by name, ID, or email…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                        />
                    </div>
                    <select
                        value={domainFilter}
                        onChange={(e) => setDomainFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white"
                    >
                        <option value="All">All Domains</option>
                        {DOMAIN_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                {/* Interns table */}
                <Card>
                    {filtered.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-400 text-sm">No interns found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        {['Intern ID', 'Name', 'Domain', 'Role', 'Start', 'End', 'Action'].map((h) => (
                                            <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filtered.filter((i) => !i.isAdmin).map((intern) => (
                                        <tr key={intern.uid} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-3 font-mono text-xs text-cyan-700">{intern.id}</td>
                                            <td className="py-3 px-3 font-medium text-navy-900">{intern.name}</td>
                                            <td className="py-3 px-3 text-slate-500">{intern.domain}</td>
                                            <td className="py-3 px-3 text-slate-500">{intern.role}</td>
                                            <td className="py-3 px-3 text-slate-500">{intern.startDate ? new Date(intern.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                                            <td className="py-3 px-3 text-slate-500">{intern.endDate ? new Date(intern.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}</td>
                                            <td className="py-3 px-3">
                                                <button
                                                    onClick={() => handleDelete(intern.uid, intern.name)}
                                                    className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </td>
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
