'use client';

import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Company Logo */}
        <Image
          src="/logo.jpg" // Place your logo in /public/logo.png
          alt="Klac Logo"
          width={72}
          height={72}
          className="rounded-md"
        />

        {/* App Name */}
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          KLAC HR Portal
        </h1>

        {/* Spinner & Message */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Loading, please wait...</span>
        </div>

        {/* Optional muted tagline */}
        <p className="text-xs text-gray-500 dark:text-gray-500">
          waste management company
        </p>
      </div>
    </div>
  );
}
