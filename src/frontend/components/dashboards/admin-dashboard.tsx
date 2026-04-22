'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Activity, AlertCircle, Apple } from 'lucide-react';
import { NutritionDbTab } from '@/components/admin/nutrition-db-tab';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalMothers: 0,
    totalFathers: 0,
    activeUsers: 0,
    totalPartnerships: 0,
    totalBabies: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/admin/stats');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // TODO: Fetch chart data from API
  const userGrowthData: any[] = [];
  const roleDistribution: any[] = [];
  const activityData: any[] = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Admin Dashboard</h2>
        <p className="text-muted-foreground">Thống kê hệ thống và quản lý người dùng</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mẹ</CardTitle>
            <Activity className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMothers}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.totalMothers / stats.totalUsers) * 100).toFixed(1)}% tổng số
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bố</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFathers}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.totalFathers / stats.totalUsers) * 100).toFixed(1)}% tổng số
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bé</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBabies}</div>
            <p className="text-xs text-muted-foreground">
              Từ {stats.totalPartnerships} cặp bố mẹ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="growth">
            <span className="hidden sm:inline">Tăng trưởng</span>
          </TabsTrigger>
          <TabsTrigger value="distribution">
            <span className="hidden sm:inline">Phân bố</span>
          </TabsTrigger>
          <TabsTrigger value="activity">
            <span className="hidden sm:inline">Hoạt động</span>
          </TabsTrigger>
          <TabsTrigger value="nutrition">
            <Apple className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Dinh dưỡng</span>
          </TabsTrigger>
        </TabsList>

        {/* Growth Chart */}
        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>Tăng trưởng Người dùng</CardTitle>
              <CardDescription>Số lượng người dùng và người dùng hoạt động theo tháng</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" name="Tổng người dùng" />
                  <Line type="monotone" dataKey="active" stroke="#10b981" name="Người dùng hoạt động" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Chart */}
        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Phân bố Vai trò</CardTitle>
              <CardDescription>Tỷ lệ người dùng theo vai trò</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Chart */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động Hàng tuần</CardTitle>
              <CardDescription>Đăng nhập và đăng ký trong tuần này</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="logins" fill="#3b82f6" name="Đăng nhập" />
                  <Bar dataKey="signups" fill="#10b981" name="Đăng ký" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nutrition Database */}
        <TabsContent value="nutrition" className="space-y-4">
          <NutritionDbTab />
        </TabsContent>
      </Tabs>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Trạng thái Hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Database</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                Hoạt động
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Server</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                Hoạt động
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Authentication</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                Hoạt động
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
