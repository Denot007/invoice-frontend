import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import apiService from '../../services/apiService';
import StripeSetupBanner from '../stripe/StripeSetupBanner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await apiService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set fallback data if API fails
      setStats({
        overview: {
          totalRevenue: 0,
          totalInvoices: 0,
          totalClients: 0,
          totalOverdue: 0,
        },
        invoiceStatus: {
          paid: 0,
          sent: 0,
          overdue: 0,
          draft: 0,
          partial: 0,
          cancelled: 0,
        },
        recentInvoices: [],
        topClients: [],
        monthlyRevenue: [],
        growth: {
          invoiceGrowth: 0,
          revenueGrowth: 0,
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Use real data from API or fallback to empty array
  const revenueData = stats?.monthlyRevenue || [];

  const invoiceStatusData = [
    { name: 'Paid', value: stats?.invoiceStatus?.paid || 0, color: '#10b981' },
    { name: 'Sent', value: stats?.invoiceStatus?.sent || 0, color: '#3b82f6' },
    { name: 'Overdue', value: stats?.invoiceStatus?.overdue || 0, color: '#ef4444' },
    { name: 'Draft', value: stats?.invoiceStatus?.draft || 0, color: '#6b7280' },
    { name: 'Partial', value: stats?.invoiceStatus?.partial || 0, color: '#f59e0b' },
    { name: 'Cancelled', value: stats?.invoiceStatus?.cancelled || 0, color: '#8b5cf6' },
  ];

  const StatCard = ({ title, value, icon: Icon, change, changeType, color, prefix = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card p-6 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-3xl font-bold ${color} mt-2`}>
            {prefix}{loading ? '---' : (typeof value === 'number' ? value.toLocaleString() : value)}
          </p>
          {change && (
            <div className={`flex items-center mt-2 ${
              changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'increase' ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color === 'text-green-600' ? 'bg-green-100 dark:bg-green-900/20' : 
                                         color === 'text-blue-600' ? 'bg-blue-100 dark:bg-blue-900/20' :
                                         color === 'text-purple-600' ? 'bg-purple-100 dark:bg-purple-900/20' :
                                         'bg-orange-100 dark:bg-orange-900/20'}`}>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your business.
          </p>
        </motion.div>
      </div>

      {/* Stripe Setup Banner */}
      <StripeSetupBanner />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={stats?.overview?.totalRevenue}
          icon={CurrencyDollarIcon}
          change={stats?.growth?.revenueGrowth ? `${stats.growth.revenueGrowth > 0 ? '+' : ''}${stats.growth.revenueGrowth}%` : undefined}
          changeType={stats?.growth?.revenueGrowth >= 0 ? "increase" : "decrease"}
          color="text-green-600"
          prefix="$"
        />
        <StatCard
          title="Total Invoices"
          value={stats?.overview?.activeInvoices || stats?.overview?.totalInvoices}
          icon={DocumentTextIcon}
          change={stats?.growth?.invoiceGrowth ? `${stats.growth.invoiceGrowth > 0 ? '+' : ''}${stats.growth.invoiceGrowth}%` : undefined}
          changeType={stats?.growth?.invoiceGrowth >= 0 ? "increase" : "decrease"}
          color="text-blue-600"
        />
        <StatCard
          title="Total Clients"
          value={stats?.overview?.totalClients}
          icon={UserGroupIcon}
          color="text-purple-600"
        />
        <StatCard
          title="Overdue Amount"
          value={stats?.overview?.totalOverdue}
          icon={ClockIcon}
          color="text-orange-600"
          prefix="$"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenue Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#0ea5e9" 
                fill="#0ea5e9" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="paid" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Invoice Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Invoice Status
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={invoiceStatusData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {invoiceStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {invoiceStatusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Invoices
          </h3>
          <div className="space-y-3">
            {stats?.recentInvoices?.slice(0, 5).map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {invoice.client?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${invoice.total?.toLocaleString()}
                  </p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Clients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Clients
          </h3>
          <div className="space-y-3">
            {stats?.topClients?.slice(0, 5).map((client, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-medium text-sm">
                      {client.name?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {client.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {client.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${client.totalPaid?.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total paid
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;