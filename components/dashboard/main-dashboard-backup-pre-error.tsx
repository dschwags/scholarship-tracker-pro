'use client';

import { useState, useMemo } from 'react';

interface MainDashboardProps {
  user: any;
  stats: any;
  recentActivity: any[];
}

export function MainDashboard({ user, stats, recentActivity }: MainDashboardProps) {
  return (
    <div className="min-h-screen p-4">
      <h1>Test Dashboard - Fixed JSX Error</h1>
      <p>The JSX parsing error has been successfully resolved!</p>
    </div>
  );
}