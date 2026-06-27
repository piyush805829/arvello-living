'use client';

import React, { useState } from 'react';
import { Target, Settings, Save } from 'lucide-react';
import type { AnalyticsSettings } from '@/types';
import { formatNumber } from '@/lib/analytics';

interface PerformanceGoalsProps {
  goals: {
    views: { current: number; target: number; percentage: number };
    clicks: { current: number; target: number; percentage: number };
    ctr: { current: number; target: number; percentage: number };
  };
  settings: AnalyticsSettings | null;
  onUpdateSettings: (settings: Partial<AnalyticsSettings>) => void;
}

export default function PerformanceGoals({ goals, settings, onUpdateSettings }: PerformanceGoalsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [viewGoal, setViewGoal] = useState(settings?.monthly_view_goal || 10000);
  const [clickGoal, setClickGoal] = useState(settings?.monthly_click_goal || 500);
  const [ctrGoal, setCtrGoal] = useState(settings?.monthly_ctr_goal || 5);

  const handleSave = () => {
    onUpdateSettings({
      monthly_view_goal: viewGoal,
      monthly_click_goal: clickGoal,
      monthly_ctr_goal: ctrGoal,
    });
    setShowSettings(false);
  };

  const goalItems = [
    {
      label: 'Monthly Views',
      current: goals.views.current,
      target: goals.views.target,
      percentage: goals.views.percentage,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      displayCurrent: formatNumber(goals.views.current),
      displayTarget: formatNumber(goals.views.target),
    },
    {
      label: 'Monthly Clicks',
      current: goals.clicks.current,
      target: goals.clicks.target,
      percentage: goals.clicks.percentage,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      displayCurrent: formatNumber(goals.clicks.current),
      displayTarget: formatNumber(goals.clicks.target),
    },
    {
      label: 'Monthly CTR',
      current: goals.ctr.current,
      target: goals.ctr.target,
      percentage: goals.ctr.percentage,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600',
      displayCurrent: `${goals.ctr.current}%`,
      displayTarget: `${goals.ctr.target}%`,
    },
  ];

  return (
    <div className="bg-white border border-outline-variant/40 rounded-3xl overflow-hidden shadow-soft">
      <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-red-500" />
          <div>
            <h3 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">
              Performance Goals
            </h3>
            <p className="text-[10px] text-foreground/40 mt-0.5">Monthly targets progress</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-foreground/40 hover:text-foreground hover:bg-background rounded-xl transition-all"
          title="Configure goals"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-6 border-b border-outline-variant/30 bg-background/40 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                View Goal
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={viewGoal}
                onChange={(e) => setViewGoal(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-outline-variant/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                Click Goal
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={clickGoal}
                onChange={(e) => setClickGoal(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-outline-variant/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                CTR Goal (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={ctrGoal}
                onChange={(e) => setCtrGoal(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-outline-variant/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-lg hover:opacity-90 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Save Goals
          </button>
        </div>
      )}

      <div className="p-6 space-y-5">
        {goalItems.map((goal) => (
          <div key={goal.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                {goal.label}
              </span>
              <span className="text-xs font-medium text-foreground/60">
                <span className={`font-bold ${goal.textColor}`}>{goal.displayCurrent}</span>
                {' / '}
                <span>{goal.displayTarget}</span>
              </span>
            </div>
            <div className={`w-full h-3 rounded-full ${goal.bgColor} overflow-hidden`}>
              <div
                className={`h-full rounded-full ${goal.color} transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min(goal.percentage, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold ${goal.textColor}`}>
                {goal.percentage.toFixed(1)}%
              </span>
              {goal.percentage >= 100 && (
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/30">
                  🎉 Goal Reached!
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
