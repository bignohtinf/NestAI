'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface Partner {
  id: number;
  name: string;
  type: 'health' | 'retail' | 'payment' | 'delivery';
  discount: number;
  status: 'active' | 'inactive';
}

export function PartnersTab() {
  const [partners] = useState<Partner[]>([
    { id: 1, name: 'LocalGrocer', type: 'retail', discount: 15, status: 'active' },
    { id: 2, name: 'HealthCare Plus', type: 'health', discount: 10, status: 'active' },
    { id: 3, name: 'FastDelivery', type: 'delivery', discount: 20, status: 'active' },
    { id: 4, name: 'PaymentGateway', type: 'payment', discount: 0, status: 'inactive' },
  ]);

  const typeEmoji = {
    health: '🏥',
    retail: '🛒',
    payment: '💳',
    delivery: '🚚',
  };

  return (
    <div className="space-y-6">
      {/* Add Partner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Partner Management</CardTitle>
          <CardDescription>Manage store partnerships and integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="bg-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add New Partner
          </Button>
        </CardContent>
      </Card>

      {/* Partners List */}
      <div className="space-y-4">
        {partners.map((partner) => (
          <Card key={partner.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-3xl">
                    {typeEmoji[partner.type]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{partner.name}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs capitalize text-muted-foreground">
                        {partner.type}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        partner.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                      }`}>
                        {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right mr-4">
                  <p className="text-lg font-bold text-primary">{partner.discount}%</p>
                  <p className="text-xs text-muted-foreground">discount</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Integration Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏪</span>
              <div>
                <p className="font-semibold text-sm">Retail Integration</p>
                <p className="text-xs text-muted-foreground">Partner store catalog sync</p>
              </div>
            </div>
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
              Connected
            </span>
          </div>

          <div className="rounded-lg border p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚚</span>
              <div>
                <p className="font-semibold text-sm">Delivery Integration</p>
                <p className="text-xs text-muted-foreground">Order tracking and status updates</p>
              </div>
            </div>
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
              Connected
            </span>
          </div>

          <div className="rounded-lg border p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">💳</span>
              <div>
                <p className="font-semibold text-sm">Payment Gateway</p>
                <p className="text-xs text-muted-foreground">Secure transaction processing</p>
              </div>
            </div>
            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
              Setup Needed
            </span>
          </div>

          <div className="rounded-lg border p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <div>
                <p className="font-semibold text-sm">Analytics Integration</p>
                <p className="text-xs text-muted-foreground">Usage and behavior tracking</p>
              </div>
            </div>
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
              Connected
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
