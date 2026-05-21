'use client';

import React from 'react';

interface ProgressBarProps {
    startDate: string;
    endDate: string;
    showLabel?: boolean;
}

export function ProgressBar({ startDate, endDate, showLabel = true }: ProgressBarProps) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();

    const totalDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    const completedDays = Math.max(0, Math.min(totalDays, Math.round((now - start) / (1000 * 60 * 60 * 24))));
    const percent = Math.round((completedDays / totalDays) * 100);
    const remaining = Math.max(0, totalDays - completedDays);

    return (
        <div className="space-y-3">
            {showLabel && (
                <div className="flex justify-between items-center">
                    <div>
                        <span className="text-2xl font-bold text-navy-900">{percent}%</span>
                        <span className="text-sm text-slate-500 ml-2">Complete</span>
                    </div>
                    <span className="text-sm text-slate-500">
                        {remaining === 0 ? '🎉 Completed!' : `${remaining} days remaining`}
                    </span>
                </div>
            )}
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-navy-700 to-cyan-500 transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(100, percent)}%` }}
                />
            </div>
            {showLabel && (
                <div className="flex justify-between text-xs text-slate-400">
                    <span>Day {completedDays} of {totalDays}</span>
                    <span>{new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
            )}
        </div>
    );
}
