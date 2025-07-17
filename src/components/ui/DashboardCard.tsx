// components/ui/DashboardCard.tsx
import React from 'react';

interface DashboardCardProps {
  title: string;
  count: number;
}

export default function DashboardCard({ title, count }: DashboardCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center text-center">
      <h2 className="text-lg font-medium text-gray-600">{title}</h2>
      <p className="text-3xl font-bold text-blue-600 mt-2">{count}</p>
    </div>
  );
}
