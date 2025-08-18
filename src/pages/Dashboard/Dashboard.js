import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  Globe,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Settings,
  RefreshCw
} from 'lucide-react';
import { dashboardAPI } from '../../services/api';
import StatCard from '../../components/Dashboard/StatCard';
import ChartSection from '../../components/Dashboard/ChartSection';

const Dashboard = () => {
  const navigate = useNavigate();

  // API calls theo ảnh
  const { data: statsResponse, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardAPI.getStats,
    retry: 1,
    onError: (error) => {
      console.error('Dashboard stats error:', error);
    }
  });

  const { data: chartResponse, isLoading: chartLoading, error: chartError } = useQuery({
    queryKey: ['dashboard-chart-data'],
    queryFn: () => dashboardAPI.getChartData('7d'),
    retry: 1,
    onError: (error) => {
      console.error('Dashboard chart data error:', error);
    }
  });

  const { data: detailedResponse, isLoading: detailedLoading, error: detailedError } = useQuery({
    queryKey: ['dashboard-detailed-stats'],
    queryFn: dashboardAPI.getDetailedStats,
    retry: 1,
    onError: (error) => {
      console.error('Dashboard detailed stats error:', error);
    }
  });

  // Navigation functions
  const handleAddSource = () => {
    navigate('/sources');
  };

  const handleRunActor = () => {
    navigate('/integrations');
  };

  const handleManageUsers = () => {
    navigate('/users');
  };

  const handleRefreshData = () => {
    window.location.reload();
  };

  const handleViewData = () => {
    navigate('/data');
  };

  const handleViewLogs = () => {
    navigate('/logs');
  };

  // Debug logs
  console.log('Dashboard API responses:', {
    statsResponse,
    chartResponse,
    detailedResponse,
    statsError,
    chartError,
    detailedError
  });

  // Data từ API thực tế - lấy trực tiếp từ response
  const statsData = statsResponse?.data || {};
  const chartDataArray = chartResponse?.data || [];
  const detailedData = detailedResponse?.data || {};

  // Stat cards với data thực từ API
  const statCards = [
    {
      title: 'Tổng dữ liệu',
      value: statsData.totalData?.value || 0,
      change: statsData.totalData?.change || '0%',
      changeType: statsData.totalData?.change?.includes('+') || statsData.totalData?.change?.includes('%') ? 'positive' : 'negative',
      icon: Database,
      color: 'blue',
    },
    {
      title: 'Nguồn crawl',
      value: statsData.totalSources?.value || 0,
      change: statsData.totalSources?.change || '0',
      changeType: statsData.totalSources?.change?.includes('+') ? 'positive' : 'negative',
      icon: Globe,
      color: 'green',
    },
    {
      title: 'Người dùng',
      value: statsData.totalUsers?.value || 0,
      change: statsData.totalUsers?.change || '0',
      changeType: statsData.totalUsers?.change?.includes('+') ? 'positive' : 'negative',
      icon: Users,
      color: 'purple',
    },
    {
      title: 'Actor đang chạy',
      value: statsData.runningActors?.value || 0,
      change: statsData.runningActors?.change || '0',
      changeType: statsData.runningActors?.change?.includes('+') ? 'positive' : 'negative',
      icon: Play,
      color: 'orange',
    },
  ];

  // Time stats từ detailed stats API
  const timeStats = {
    last24h: detailedData.timeStats?.last24h || 0,
    last7Days: detailedData.timeStats?.last7Days || 0,
    last30Days: detailedData.timeStats?.last30Days || 0
  };

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

      {/* Charts and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thống kê dữ liệu (7 ngày qua)
          </h3>
          <ChartSection data={chartDataArray} isLoading={chartLoading} />
        </div>

        {/* Time Stats */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thống kê thời gian
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium text-gray-900">24 giờ qua</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{timeStats.last24h}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium text-gray-900">7 ngày qua</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{timeStats.last7Days}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-medium text-gray-900">30 ngày qua</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{timeStats.last30Days}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data by Type and Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data by Type */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Dữ liệu theo loại
          </h3>
          <div className="space-y-3">
            {(detailedData.byType || []).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900 capitalize">{item._id}</span>
                </div>
                <span className="text-xl font-bold text-gray-900">{item.count}</span>
              </div>
            ))}
            {(!detailedData.byType || detailedData.byType.length === 0) && (
              <div className="text-center py-4 text-gray-500">
                Không có dữ liệu
              </div>
            )}
          </div>
        </div>

        {/* Data by Source */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Dữ liệu theo nguồn
          </h3>
          <div className="space-y-3">
            {(detailedData.bySource || []).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">{item._id}</span>
                </div>
                <span className="text-xl font-bold text-gray-900">{item.count}</span>
              </div>
            ))}
            {(!detailedData.bySource || detailedData.bySource.length === 0) && (
              <div className="text-center py-4 text-gray-500">
                Không có dữ liệu
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thao tác nhanh
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button onClick={handleAddSource} className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Globe className="w-6 h-6 text-blue-600 mr-3" />
            <span className="font-medium">Thêm nguồn crawl</span>
          </button>
          <button onClick={handleRunActor} className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Play className="w-6 h-6 text-green-600 mr-3" />
            <span className="font-medium">Chạy actor</span>
          </button>
          <button onClick={handleManageUsers} className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-6 h-6 text-purple-600 mr-3" />
            <span className="font-medium">Quản lý người dùng</span>
          </button>
          <button onClick={handleViewData} className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Database className="w-6 h-6 text-indigo-600 mr-3" />
            <span className="font-medium">Xem dữ liệu</span>
          </button>
          <button onClick={handleViewLogs} className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 className="w-6 h-6 text-orange-600 mr-3" />
            <span className="font-medium">Xem nhật ký</span>
          </button>
          <button onClick={handleRefreshData} className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-6 h-6 text-teal-600 mr-3" />
            <span className="font-medium">Làm mới dữ liệu</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 