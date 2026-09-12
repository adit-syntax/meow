/**
 * frontend/src/components/ui/Skeleton.tsx
 * SkyGuard AI — Skeleton Loaders for Suspense and Loading States.
 */

import React from 'react';

// ─── Base Skeleton Pulse ────────────────────────────────────────────

export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#1B2A44]/60 ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

// ─── Page-Level Skeleton (Suspense Fallback) ────────────────────────

export function PageSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-6 animate-in fade-in duration-200">
      {/* Page title skeleton */}
      <Skeleton className="h-7 w-48" />

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Skeleton className="lg:col-span-3 h-80 rounded-xl" />
        <Skeleton className="lg:col-span-2 h-80 rounded-xl" />
      </div>

      {/* Table skeleton */}
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

// ─── Table Skeleton ─────────────────────────────────────────────────

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 p-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 flex-1" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

// ─── MetricCard Skeleton ────────────────────────────────────────────

export function MetricCardSkeleton() {
  return (
    <div className="bg-[#152033]/90 border border-[rgba(255,255,255,0.08)] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// ─── Chart Skeleton ─────────────────────────────────────────────────

export function ChartSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={`bg-[#152033]/90 border border-[rgba(255,255,255,0.08)] rounded-xl p-4 ${height} flex items-end gap-1`}>
      {Array.from({ length: 24 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-sm"
          style={{ height: `${20 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  );
}
