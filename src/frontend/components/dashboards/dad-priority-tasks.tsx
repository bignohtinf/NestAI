'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Heart, Home, Pill, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  category: 'health' | 'household' | 'emotional';
  priority: 'urgent' | 'high' | 'normal';
  completed: boolean;
  description?: string;
  dueTime?: string;
}

const categoryConfig = {
  health: {
    icon: Pill,
    label: 'Chăm sóc sức khỏe',
    color: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  household: {
    icon: Home,
    label: 'Hỗ trợ sinh hoạt',
    color: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  emotional: {
    icon: Heart,
    label: 'Hỗ trợ tinh thần',
    color: 'bg-pink-50 dark:bg-pink-900/20',
    borderColor: 'border-pink-200 dark:border-pink-800',
    badgeColor: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  },
};

const priorityConfig = {
  urgent: {
    icon: AlertCircle,
    label: 'Khẩn cấp',
    color: 'text-red-600 dark:text-red-400',
  },
  high: {
    icon: AlertCircle,
    label: 'Cao',
    color: 'text-orange-600 dark:text-orange-400',
  },
  normal: {
    icon: null,
    label: 'Bình thường',
    color: 'text-gray-600 dark:text-gray-400',
  },
};

interface DadPriorityTasksProps {
  tasks?: Task[];
  momHealthScore?: number;
  onTaskComplete?: (taskId: string) => void;
}

export function DadPriorityTasks({
  tasks = [],
  momHealthScore = 75,
  onTaskComplete,
}: DadPriorityTasksProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(
    new Set(tasks.filter(t => t.completed).map(t => t.id))
  );

  // Auto-prioritize urgent tasks based on mom's health
  const sortedTasks = [...tasks].sort((a, b) => {
    // If mom's health is low, prioritize health tasks
    if (momHealthScore < 60) {
      if (a.category === 'health' && b.category !== 'health') return -1;
      if (a.category !== 'health' && b.category === 'health') return 1;
    }

    // Sort by priority
    const priorityOrder = { urgent: 0, high: 1, normal: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const handleTaskComplete = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
    onTaskComplete?.(taskId);
  };

  // Group tasks by category
  const groupedTasks = sortedTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const completionRate = tasks.length > 0 
    ? Math.round((completedTasks.size / tasks.length) * 100)
    : 0;

  return (
    <Card className="border-2 border-amber-200 dark:border-amber-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-amber-500" />
              Nhiệm vụ ưu tiên cho bố
            </CardTitle>
            <CardDescription>
              {completedTasks.size} / {tasks.length} hoàn thành
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-600">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">Tiến độ hôm nay</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Alert if needed */}
        {momHealthScore < 60 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-red-900 dark:text-red-100">Mẹ cần hỗ trợ</p>
              <p className="text-red-700 dark:text-red-300">Ưu tiên các nhiệm vụ chăm sóc sức khỏe</p>
            </div>
          </div>
        )}

        {/* Tasks by Category */}
        <div className="space-y-4">
          {Object.entries(groupedTasks).map(([category, categoryTasks]) => {
            const config = categoryConfig[category as keyof typeof categoryConfig];
            const Icon = config.icon;

            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold text-muted-foreground">{config.label}</p>
                  <Badge variant="default" className="text-xs">
                    {categoryTasks.filter(t => !completedTasks.has(t.id)).length}
                  </Badge>
                </div>

                <div className={`${config.color} border ${config.borderColor} rounded-lg p-3 space-y-2`}>
                  {categoryTasks.map((task) => {
                    const isCompleted = completedTasks.has(task.id);
                    const PriorityIcon = priorityConfig[task.priority].icon;

                    return (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-2 rounded hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                      >
                        <button
                          onClick={() => handleTaskComplete(task.id)}
                          className="shrink-0 mt-0.5 focus:outline-none"
                        >
                          <CheckCircle2
                            className={`h-5 w-5 transition-colors ${
                              isCompleted
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-300 dark:text-gray-600 hover:text-gray-400'
                            }`}
                          />
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <p
                              className={`text-sm font-medium transition-all ${
                                isCompleted
                                  ? 'line-through text-muted-foreground'
                                  : 'text-foreground'
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.priority !== 'normal' && PriorityIcon && (
                              <PriorityIcon
                                className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${priorityConfig[task.priority].color}`}
                              />
                            )}
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {task.description}
                            </p>
                          )}
                          {task.dueTime && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ⏰ {task.dueTime}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">Không có nhiệm vụ nào hôm nay</p>
            <p className="text-xs text-muted-foreground mt-1">Tất cả đã hoàn thành! 🎉</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
