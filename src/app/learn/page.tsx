
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LearnPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the main home page to choose a category
        router.replace('/');
    }, [router]);

    // Render a loading state or nothing while redirecting
    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Redirecting...</p>
        </div>
    );
}
