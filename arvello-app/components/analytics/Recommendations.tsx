'use client';

import React from 'react';
import { Lightbulb, CheckCircle, AlertTriangle, Info, Zap } from 'lucide-react';
import type { AnalyticsRecommendation } from '@/types';

interface RecommendationsProps {
  recommendations: AnalyticsRecommendation[];
}

const ICONS: Record<string, React.ElementType> = {
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
  action: Zap,
};

const COLORS: Record<string, string> = {
  success: 'bg-emerald-50 border-emerald-200/40 text-emerald-700',
  warning: 'bg-amber-50 border-amber-200/40 text-amber-700',
  info: 'bg-blue-50 border-blue-200/40 text-blue-700',
  action: 'bg-purple-50 border-purple-200/40 text-purple-700',
};

const ICON_COLORS: Record<string, string> = {
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
  action: 'text-purple-500',
};

export default function Recommendations({ recommendations }: RecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <div className="bg-white border border-outline-variant/40 rounded-3xl overflow-hidden shadow-soft">
        <div className="p-6 border-b border-outline-variant/30 flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h3 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">
            Recommendations
          </h3>
        </div>
        <div className="p-12 text-center">
          <p className="text-sm text-foreground/40 italic">
            Not enough data to generate recommendations yet. Keep publishing!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-outline-variant/40 rounded-3xl overflow-hidden shadow-soft">
      <div className="p-6 border-b border-outline-variant/30 flex items-center gap-3">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        <div>
          <h3 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">
            Smart Recommendations
          </h3>
          <p className="text-[10px] text-foreground/40 mt-0.5">AI-generated insights based on your analytics data</p>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {recommendations.map((rec) => {
          const Icon = ICONS[rec.type] || Info;
          const colorClass = COLORS[rec.type] || COLORS.info;
          const iconColor = ICON_COLORS[rec.type] || ICON_COLORS.info;

          return (
            <div
              key={rec.id}
              className={`flex items-start gap-4 p-4 rounded-xl border ${colorClass}`}
            >
              <Icon className={`w-5 h-5 ${iconColor} shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-xs font-bold">{rec.title}</h4>
                  {rec.value && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/60 border border-current/10">
                      {rec.value}
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed opacity-80">{rec.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
