'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}
            <input
                id={id}
                className={cn(
                    'w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400',
                    'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors',
                    error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300',
                    props.readOnly && 'bg-slate-50 cursor-not-allowed text-slate-500',
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
        </div>
    );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}
            <textarea
                id={id}
                rows={4}
                className={cn(
                    'w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 resize-none',
                    'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors',
                    error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300',
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}
            <select
                id={id}
                className={cn(
                    'w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900',
                    'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors',
                    error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300',
                    className
                )}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
