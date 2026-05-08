'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWellnessData } from '../../hooks/useWellnessData';
import { AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface InsightsSectionProps {
  userId: string;
}

const WELLNESS_TIPS = [
  {
    title: 'Stay Hydrated',
    description: 'Drinking enough water helps with milk production and overall health.',
    icon: '💧'
  },
  {
    title: 'Get Quality Sleep',
    description: 'Aim for 7-8 hours of sleep daily. Rest is crucial for recovery.',
    icon: '😴'
  },
  {
    title: 'Balanced Nutrition',
    description: 'Eat nutrient-rich foods to support your health and energy levels.',
    icon: '🥗'
  },
  {
    title: 'Gentle Movement',
    description: 'Light exercise like walking can boost mood and energy.',
    icon: '🚶'
  },
  {
    title: 'Stress Management',
    description: 'Practice breathing exercises or meditation for mental wellness.',
    icon: '🧘'
  },
  {
    title: 'Regular Checkups',
    description: 'Schedule regular health checkups with your doctor.',
    icon: '👨‍⚕️'
  }
];

export const InsightsSection = ({ userId }: InsightsSectionProps) => {
  const { trend, entries, loading } = useWellnessData(userId);

  if (loading) {
    return <div>Loading insights...</div>;
  }

  const chartData = trend?.trend_data?.map((entry) => ({
    date: format(parseISO(entry.entry_date), 'MMM dd'),
    milk_score: entry.milk_score || 0,
    mood: entry.mood * 20, // Scale to 0-100
    energy: entry.energy_level * 20,
    sleep: Math.min(entry.sleep_hours * 12.5, 100) // Scale to 0-100
  })) || [];

  const avgMood = trend?.metrics.avg_mood || 0;
  const avgMilkScore = trend?.metrics.avg_milk_score || 0;
  const avgSleep = trend?.metrics.avg_sleep || 0;

  return (
    <div className="space-y-6">
      {/* Trend Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">7-Day Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="milk_score" stroke="#ef4444" strokeWidth={2} name="Milk Score" />
              <Line type="monotone" dataKey="mood" stroke="#3b82f6" strokeWidth={2} name="Mood" />
              <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} name="Energy" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Health Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-blue-50">
          <p className="text-sm text-slate-600">Average Mood</p>
          <p className="text-2xl font-bold text-blue-700">{avgMood.toFixed(1)}/5</p>
        </div>
        <div className="border rounded-lg p-4 bg-rose-50">
          <p className="text-sm text-slate-600">Average Milk Score</p>
          <p className="text-2xl font-bold text-rose-700">{avgMilkScore.toFixed(0)}</p>
        </div>
        <div className="border rounded-lg p-4 bg-purple-50">
          <p className="text-sm text-slate-600">Average Sleep</p>
          <p className="text-2xl font-bold text-purple-700">{avgSleep.toFixed(1)}h</p>
        </div>
      </div>

      {/* Personalized Tips */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold">Wellness Tips</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {WELLNESS_TIPS.map((tip, idx) => (
            <div key={idx} className="border rounded-lg p-4 hover:border-slate-400 transition-colors">
              <div className="text-3xl mb-2">{tip.icon}</div>
              <p className="font-semibold text-sm mb-1">{tip.title}</p>
              <p className="text-xs text-slate-600">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {avgMood < 3 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-900">Mood Check-in</p>
            <p className="text-sm text-slate-700">Your mood has been lower recently. Consider taking breaks, meditating, or talking to someone you trust.</p>
          </div>
        </div>
      )}

      {avgMilkScore < 50 && (
        <div className="bg-rose-50 border-l-4 border-rose-500 rounded p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-900">Milk Score</p>
            <p className="text-sm text-slate-700">Your milk score is lower than usual. Ensure good hydration, nutrition, and rest. Consult your doctor if concerned.</p>
          </div>
        </div>
      )}

      {avgSleep < 6 && (
        <div className="bg-purple-50 border-l-4 border-purple-500 rounded p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-900">Sleep</p>
            <p className="text-sm text-slate-700">You're not getting enough sleep. Try to establish a consistent sleep schedule and create a relaxing bedtime routine.</p>
          </div>
        </div>
      )}
    </div>
  );
};
