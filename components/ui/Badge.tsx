'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { WorkStatus } from '@/types';

interface BadgeProps {
    status: WorkStatus | string;
    className?: string;
}

const colorMap: Record<string, string> = {
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
    Blocked: 'bg-red-50 text-red-700 border-red-200',
};

export function Badge({ status, className }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
                colorMap[status] ?? 'bg-slate-50 text-slate-600 border-slate-200',
                className
            )}
        >
            <span
                className={cn(
                    'w-1.5 h-1.5 rounded-full mr-1.5',
                    status === 'Completed' && 'bg-emerald-500',
                    status === 'In Progress' && 'bg-amber-500',
                    status === 'Blocked' && 'bg-red-500',
                    !['Completed', 'In Progress', 'Blocked'].includes(status) && 'bg-slate-400'
                )}
            />
            {status}
        </span>
    );
}
