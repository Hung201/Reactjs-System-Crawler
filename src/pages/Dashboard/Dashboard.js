import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Database,
  Globe,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Play
} from 'lucide-react';
import { dashboardAPI } from '../../services/api';
import { DATA_STATUS, SOURCE_STATUS } from '../../utils/constants';
import StatCard from '../../components/Dashboard/StatCard';
import RecentDataTable from '../../components/Dashboard/RecentDataTable';
import ChartSection from '../../components/Dashboard/ChartSection';

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardAPI.getStats,
    retry: 1,
    onError: (error) => {
      console.error('Dashboard stats error:', error);
    }
  });

  const { data: recentData, isLoading: recentLoading, error: recentError } = useQuery({
    queryKey: ['dashboard-recent-data'],
    queryFn: dashboardAPI.getRecentData,
    retry: 1,
    onError: (error) => {
      console.error('Dashboard recent data error:', error);
    }
  });

  const { data: chartData, isLoading: chartLoading, error: chartError } = useQuery({
    queryKey: ['dashboard-chart-data'],
    queryFn: () => dashboardAPI.getChartData('7d'),
    retry: 1,
    onError: (error) => {
      console.error('Dashboard chart data error:', error);
    }
  });

  const statCards = [
    {
      title: 'Tổng dữ liệu',
      value: stats?.totalData || 0,
      change: '+12%',
      changeType: 'positive',
      icon: Database,
      color: 'blue',
    },
    {
      title: 'Nguồn crawl',
      value: stats?.totalSources || 0,
      change: '+3',
      changeType: 'positive',
      icon: Globe,
      color: 'green',
    },
    {
      title: 'Người dùng',
      value: stats?.totalUsers || 0,
      change: '+1',
      changeType: 'positive',
      icon: Users,
      color: 'purple',
    },
    {
      title: 'Actor đang chạy',
      value: stats?.runningActors || 0,
      change: '-2',
      changeType: 'negative',
      icon: Play,
      color: 'orange',
    },
  ];

  const statusStats = [
    {
      label: 'Chờ xử lý',
      value: stats?.pendingData || 0,
      color: 'yellow',
      icon: Clock,
    },
    {
      label: 'Đã dịch',
      value: stats?.translatedData || 0,
      color: 'blue',
      icon: CheckCircle,
    },
    {
      label: 'Đã duyệt',
      value: stats?.approvedData || 0,
      color: 'green',
      icon: CheckCircle,
    },
    {
      label: 'Lỗi',
      value: stats?.errorData || 0,
      color: 'red',
      icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Tổng quan hệ thống crawl dữ liệu</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* Charts and Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Section */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thống kê dữ liệu (7 ngày qua)
          </h3>
          <ChartSection data={chartData} isLoading={chartLoading} />
        </div>

        {/* Status Overview */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Trạng thái dữ liệu
          </h3>
          <div className="space-y-4">
            {statusStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <span className="font-medium text-gray-900">{stat.label}</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Data Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Dữ liệu gần đây
          </h3>
          <button className="btn-primary">
            Xem tất cả
          </button>
        </div>
        <RecentDataTable
          data={recentData}
          isLoading={recentLoading}
          error={recentError}
        />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thao tác nhanh
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Globe className="w-6 h-6 text-primary-600 mr-3" />
            <span className="font-medium">Thêm nguồn crawl</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Play className="w-6 h-6 text-green-600 mr-3" />
            <span className="font-medium">Chạy actor</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-6 h-6 text-purple-600 mr-3" />
            <span className="font-medium">Quản lý người dùng</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 