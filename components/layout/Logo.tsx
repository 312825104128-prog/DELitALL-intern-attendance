'use client';

import React from 'react';
import Image from 'next/image';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
    const dims = { sm: 28, md: 36, lg: 48 };
    const px = dims[size];

    return (
        <div className="flex items-center gap-2.5">
            <div className="relative flex-shrink-0" style={{ width: px, height: px }}>
                <Image
                    src="/logo.png"
                    alt="DELitALL"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
            {showText && (
                <div>
                    <p className="font-bold text-navy-900 leading-tight" style={{ fontSize: size === 'sm' ? 14 : size === 'md' ? 16 : 20 }}>
                        DELitALL
                    </p>
                    {size !== 'sm' && (
                        <p className="text-xs text-slate-400 leading-tight">Internship Portal</p>
                    )}
                </div>
            )}
        </div>
    );
}
