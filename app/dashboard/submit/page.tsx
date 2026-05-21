'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import type { WorkStatus, HoursContributed } from '@/types';

const STATUS_OPTIONS = [
    { value: 'Completed', label: '✅ Completed' },
    { value: 'In Progress', label: '🔄 In Progress' },
    { value: 'Blocked', label: '🚫 Blocked' },
];

const HOURS_OPTIONS = [
    { value: '1-2 Hours', label: '1–2 Hours' },
    { value: '2-4 Hours', label: '2–4 Hours' },
    { value: '4-6 Hours', label: '4–6 Hours' },
    { value: '6+ Hours', label: '6+ Hours' },
];

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'application/zip', 'application/x-zip-compressed'];

export default function SubmitPage() {
    const { user, intern, loading } = useAuth();
    const router = useRouter();

    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [checkingDuplicate, setCheckingDuplicate] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [assignedTask, setAssignedTask] = useState('');
    const [workStatus, setWorkStatus] = useState<WorkStatus>('In Progress');
    const [hours, setHours] = useState<HoursContributed>('2-4 Hours');
    const [learningDetails, setLearningDetails] = useState('');
    const [workCompleted, setWorkCompleted] = useState('');
    const [challenges, setChallenges] = useState('');
    const [support, setSupport] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploadUrl, setUploadUrl] = useState('');
    const [uploadName, setUploadName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (!loading && !user) router.replace('/login');
    }, [user, loading, router]);

    useEffect(() => {
        if (!intern) { setCheckingDuplicate(false); return; }
        setCheckingDuplicate(true);
        fetch(`/api/check-submission?internId=${intern.id}&date=${today}`, { cache: 'no-store' })
            .then((r) => r.json())
            .then((d) => setAlreadySubmitted(d.submitted))
            .finally(() => setCheckingDuplicate(false));
    }, [intern, today]);

    const handleFileDrop = useCallback(async (fileToUpload: File) => {
        if (!ALLOWED_TYPES.includes(fileToUpload.type)) {
            setError('Invalid file type. Allowed: PDF, DOCX, PNG, JPG, ZIP');
            return;
        }
        if (fileToUpload.size > 10 * 1024 * 1024) {
            setError('File too large. Max 10MB allowed.');
            return;
        }
        setFile(fileToUpload);
        setUploading(true);
        setError('');
        try {
            const fd = new FormData();
            fd.append('file', fileToUpload);
            fd.append('domain', intern?.domain ?? 'Other');
            fd.append('internName', intern?.name ?? 'Unknown');
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setUploadUrl(data.fileUrl);
            setUploadName(data.fileName);
        } catch (err: unknown) {
            setError((err as Error).message ?? 'Upload failed');
            setFile(null);
        } finally {
            setUploading(false);
        }
    }, [intern]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!intern || !user) return;
        if (!assignedTask.trim()) { setError('Please enter your assigned task.'); return; }
        if (!learningDetails.trim()) { setError('Please fill in what you learned today.'); return; }
        if (!workCompleted.trim()) { setError('Please describe the work completed.'); return; }

        setSubmitting(true);
        setError('');
        try {
            const payload = {
                internId: intern.id,
                internName: intern.name,
                email: intern.email,
                domain: intern.domain,
                date: today,
                assignedTask,
                workStatus,
                hoursContributed: hours,
                learningDetails,
                workCompleted,
                challengesFaced: challenges,
                supportRequired: support,
                uploadedFileUrl: uploadUrl,
                uploadedFileName: uploadName,
            };
            const res = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSuccess(true);
        } catch (err: unknown) {
            setError((err as Error).message ?? 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || checkingDuplicate) {
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
                        <p className="text-sm text-slate-500">Your account is not registered yet. Please ask the Admin to add your profile first.</p>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    if (alreadySubmitted) {
        return (
            <DashboardLayout>
                <div className="max-w-lg mx-auto animate-fade-in">
                    <Card className="text-center py-12">
                        <div className="text-5xl mb-4">✅</div>
                        <h2 className="text-xl font-bold text-navy-900">Already submitted today!</h2>
                        <p className="text-slate-500 mt-2">You&apos;ve already submitted your progress for {new Date(today).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}.</p>
                        <p className="text-sm text-slate-400 mt-1">Only one submission per day is allowed. Come back tomorrow!</p>
                        <Button onClick={() => router.push('/dashboard')} className="mt-6">Back to Dashboard</Button>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    if (success) {
        return (
            <DashboardLayout>
                <div className="max-w-lg mx-auto animate-fade-in">
                    <Card className="text-center py-12">
                        <div className="text-5xl mb-4">🎉</div>
                        <h2 className="text-xl font-bold text-navy-900">Submission Successful!</h2>
                        <p className="text-slate-500 mt-2">Your daily progress for {new Date(today).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} has been saved.</p>
                        <div className="flex gap-3 justify-center mt-6">
                            <Button onClick={() => router.push('/dashboard')}>Dashboard</Button>
                            <Button variant="secondary" onClick={() => router.push('/dashboard/history')}>View History</Button>
                        </div>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto animate-fade-in">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-navy-900">Daily Progress Submission</h1>
                    <p className="text-slate-500 mt-1">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Auto-filled info */}
                    <Card>
                        <h3 className="text-base font-semibold text-navy-900 mb-4">Intern Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="Your Name" value={intern.name} readOnly id="name" />
                            <Input label="Intern ID" value={intern.id} readOnly id="internId" />
                            <Input label="Email" value={intern.email} readOnly id="email" />
                            <Input label="Domain" value={intern.domain} readOnly id="domain" />
                            <Input label="Date" value={today} readOnly id="date" hint="Auto-filled — cannot be changed" />
                        </div>
                    </Card>

                    {/* Section 1: Work info */}
                    <Card>
                        <h3 className="text-base font-semibold text-navy-900 mb-4">Section 1 — Work Information</h3>
                        <div className="space-y-4">
                            <Input
                                id="task"
                                label="Assigned Task *"
                                placeholder="e.g. Build the login page UI"
                                value={assignedTask}
                                onChange={(e) => setAssignedTask(e.target.value)}
                                required
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Select
                                    id="status"
                                    label="Work Status"
                                    options={STATUS_OPTIONS}
                                    value={workStatus}
                                    onChange={(e) => setWorkStatus(e.target.value as WorkStatus)}
                                />
                                <Select
                                    id="hours"
                                    label="Hours Contributed"
                                    options={HOURS_OPTIONS}
                                    value={hours}
                                    onChange={(e) => setHours(e.target.value as HoursContributed)}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Section 2: Progress details */}
                    <Card>
                        <h3 className="text-base font-semibold text-navy-900 mb-4">Section 2 — Progress Details</h3>
                        <div className="space-y-4">
                            <Textarea
                                id="learning"
                                label="What did you learn today? *"
                                placeholder="Describe your key learnings from today..."
                                value={learningDetails}
                                onChange={(e) => setLearningDetails(e.target.value)}
                                required
                            />
                            <Textarea
                                id="work"
                                label="Work completed today *"
                                placeholder="Briefly explain what you completed..."
                                value={workCompleted}
                                onChange={(e) => setWorkCompleted(e.target.value)}
                                required
                            />
                            <Textarea
                                id="challenges"
                                label="Challenges faced (optional)"
                                placeholder="Any blockers or difficulties?"
                                value={challenges}
                                onChange={(e) => setChallenges(e.target.value)}
                            />
                            <Textarea
                                id="support"
                                label="Support / Resources required (optional)"
                                placeholder="Do you need any tools, guidance, or resources?"
                                value={support}
                                onChange={(e) => setSupport(e.target.value)}
                            />
                        </div>
                    </Card>

                    {/* Section 3: File upload */}
                    <Card>
                        <h3 className="text-base font-semibold text-navy-900 mb-2">Section 3 — File Upload (optional)</h3>
                        <p className="text-xs text-slate-400 mb-4">PDF, DOCX, PNG, JPG, or ZIP · Max 10MB</p>

                        {!file ? (
                            <div
                                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${dragOver ? 'border-cyan-400 bg-cyan-50' : 'border-slate-200 hover:border-cyan-300 hover:bg-slate-50'
                                    }`}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragOver(false);
                                    const f = e.dataTransfer.files[0];
                                    if (f) handleFileDrop(f);
                                }}
                                onClick={() => document.getElementById('fileInput')?.click()}
                            >
                                <div className="text-4xl mb-3">📎</div>
                                <p className="text-sm font-medium text-slate-600">Drag & drop a file here</p>
                                <p className="text-xs text-slate-400 mt-1">or click to browse</p>
                                <input
                                    id="fileInput"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.docx,.png,.jpg,.jpeg,.zip"
                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileDrop(f); }}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                                {uploading ? (
                                    <div className="w-5 h-5 border-2 border-navy-900/20 border-t-navy-900 rounded-full animate-spin" />
                                ) : (
                                    <span className="text-xl">📄</span>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-navy-900 truncate">{file.name}</p>
                                    <p className="text-xs text-slate-400">{uploading ? 'Uploading…' : 'Uploaded ✓'}</p>
                                </div>
                                {!uploading && (
                                    <button
                                        type="button"
                                        onClick={() => { setFile(null); setUploadUrl(''); setUploadName(''); }}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        )}
                    </Card>

                    <Button type="submit" loading={submitting} size="lg" className="w-full">
                        Submit Daily Progress
                    </Button>
                </form>
            </div>
        </DashboardLayout>
    );
}
