'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: 'shopping' | 'cooking' | 'reminder' | 'alert';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueTime?: string;
}

const initialActions: ActionItem[] = [
  {
    id: '1',
    title: 'Mua cá hồi',
    description: 'Cá hồi tươi cho bữa tối',
    category: 'shopping',
    priority: 'high',
    completed: false,
    dueTime: '17:00',
  },
  {
    id: '2',
    title: 'Nấu cơm chiên',
    description: 'Cơm chiên với rau xanh và trứng',
    category: 'cooking',
    priority: 'high',
    completed: false,
    dueTime: '18:00',
  },
  {
    id: '3',
    title: 'Nhắc mẹ uống nước',
    description: 'Mẹ cần uống thêm 500ml nước',
    category: 'reminder',
    priority: 'medium',
    completed: false,
    dueTime: '14:00',
  },
  {
    id: '4',
    title: 'Mua sữa',
    description: 'Sữa tươi cho mẹ',
    category: 'shopping',
    priority: 'medium',
    completed: true,
  },
  {
    id: '5',
    title: 'Kiểm tra protein',
    description: 'Mẹ thiếu protein - cần ăn thêm',
    category: 'alert',
    priority: 'high',
    completed: false,
  },
];

export function ActionChecklist() {
  const [actions, setActions] = useState<ActionItem[]>(initialActions);

  const toggleAction = (id: string) => {
    setActions((prev) =>
      prev.map((action) =>
        action.id === id ? { ...action, completed: !action.completed } : action
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'shopping':
        return '🛒';
      case 'cooking':
        return '🍳';
      case 'reminder':
        return '🔔';
      case 'alert':
        return '⚠️';
      default:
        return '📋';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'shopping':
        return 'Mua sắm';
      case 'cooking':
        return 'Nấu ăn';
      case 'reminder':
        return 'Nhắc nhở';
      case 'alert':
        return 'Cảnh báo';
      default:
        return 'Khác';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      default:
        return '';
    }
  };

  const completedCount = actions.filter((a) => a.completed).length;
  const totalCount = actions.length;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Tiến độ hôm nay</span>
            <span className="text-sm font-bold text-primary">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <div className="space-y-2">
        {actions.map((action) => (
          <Card
            key={action.id}
            className={`transition-all ${
              action.completed ? 'opacity-60 bg-muted' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={action.completed}
                  onCheckedChange={() => toggleAction(action.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getCategoryIcon(action.category)}</span>
                    <h4
                      className={`font-semibold ${
                        action.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {action.title}
                    </h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(
                        action.priority
                      )}`}
                    >
                      {action.priority === 'high'
                        ? 'Cao'
                        : action.priority === 'medium'
                        ? 'Trung'
                        : 'Thấp'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {action.description}
                  </p>
                  {action.dueTime && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {action.dueTime}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {actions.some((a) => a.category === 'alert' && !a.completed) && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-200 mb-1">
                  Cảnh báo dinh dưỡng
                </p>
                <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
                  {actions
                    .filter((a) => a.category === 'alert' && !a.completed)
                    .map((a) => (
                      <li key={a.id}>• {a.title}</li>
                    ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
