import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths
    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/favicon') ||
        pathname === '/logo.png'
    ) {
        return NextResponse.next();
    }

    // Check Firebase session cookie (client-side auth handles the actual redirect)
    // We let the page-level useEffect handle redirect logic for simplicity
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
