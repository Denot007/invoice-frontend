import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import apiService from '../services/apiService';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('12');
  const [selectedView, setSelectedView] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Use the existing dashboard stats endpoint that we know works
      const data = await apiService.getDashboardStats();
      console.log('Dashboard stats received:', data); // Debug log
      console.log('Financial Summary:', data.data.financialSummary); // Debug financial data
      console.log('Overview:', data.data.overview); // Debug overview data
      console.log('Average Invoice from backend:', data.data.overview.avgInvoiceValue); // Debug avg invoice
      
      // Use backend's corrected totalRevenue for active invoices only
      const calculatedTotalInvoiced = data.data.overview.totalRevenue || data.data.financialSummary.totalInvoiced || 
        (data.data.financialSummary.totalPaid + data.data.financialSummary.totalOutstanding);
      
      const calculatedAvgInvoice = data.data.overview.avgInvoiceValue || 
        (calculatedTotalInvoiced && (data.data.overview.activeInvoices || data.data.overview.totalInvoices) ? 
          calculatedTotalInvoiced / (data.data.overview.activeInvoices || data.data.overview.totalInvoices) : 0);
      
      const calculatedCollectionRate = data.data.financialSummary.collectionRate || 
        (calculatedTotalInvoiced > 0 ? 
          (data.data.financialSummary.totalPaid / calculatedTotalInvoiced) * 100 : 0);

      console.log('Calculated Total Invoiced:', calculatedTotalInvoiced);
      console.log('Calculated Avg Invoice:', calculatedAvgInvoice);  
      console.log('Calculated Collection Rate:', calculatedCollectionRate);
      console.log('Top Clients Data:', data.data.topClients); // Debug top clients

      // Transform the data to match our expected format
      const transformedData = {
        rawData: data.data, // Keep the raw data from backend like Dashboard does
        invoices: {
          financial_summary: {
            ...data.data.financialSummary,
            totalInvoiced: calculatedTotalInvoiced, // Use calculated total
            total_invoices: data.data.overview.activeInvoices || data.data.overview.totalInvoices // Use active invoices count, excluding drafts
          },
          monthly_trends: data.data.monthlyRevenue,
          status_distribution: Object.entries(data.data.invoiceStatus).map(([status, count]) => ({
            status,
            count,
            value: 0 // Will be calculated from actual invoice data
          })),
          top_clients: data.data.topClients,
          kpis: {
            average_invoice_value: calculatedAvgInvoice,
            collection_rate: calculatedCollectionRate
          }
        },
        clients: {
          summary: {
            total_clients: data.data.overview.totalClients,
            active_clients: data.data.overview.activeClients,
            average_client_value: data.data.overview.avgInvoiceValue
          },
          client_performance: data.data.topClients,
          monthly_acquisition: [], // Will be empty for now
        },
        estimates: {
          summary: {
            total_estimates: data.data.estimatesSummary.totalCount,
            conversion_rate: data.data.estimatesSummary.conversionRate,
            total_value: data.data.estimatesSummary.totalValue,
            average_value: data.data.estimatesSummary.averageValue
          },
          status_distribution: Object.entries(data.data.estimateStatus).map(([status, count]) => ({
            status,
            count,
            value: 0 // Will be calculated from actual estimate data
          })),
          monthly_trends: data.data.monthlyEstimates,
          aging_analysis: []
        }
      };
      
      setAnalyticsData(transformedData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      console.error('Full error details:', error.response?.data || error.message);
      toast.error(`Failed to load analytics data: ${error.response?.status === 404 ? 'Endpoints not found' : 'Server error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const blob = await apiService.exportInvoicesPDF();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  // Color schemes for charts
  const chartColors = {
    primary: '#4f46e5',
    secondary: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#8b5cf6'
  };

  const pieColors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">No Data Available</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Analytics data could not be loaded. Please try again later.
        </p>
      </div>
    );
  }

  const { invoices, clients, estimates } = analyticsData;

  const StatCard = ({ title, value, change, icon: Icon, color = 'primary' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}% from last period
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights into your business performance
          </p>
          {/* Debug info - shows data source */}
         
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="3">Last 3 Months</option>
              <option value="6">Last 6 Months</option>
              <option value="12">Last 12 Months</option>
            </select>
          </div>
          
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'financial', label: 'Financial', icon: CurrencyDollarIcon },
            { id: 'clients', label: 'Clients', icon: UsersIcon },
            { id: 'estimates', label: 'Estimates', icon: DocumentTextIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id)}
              className={`${
                selectedView === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(analyticsData?.rawData?.overview?.totalRevenue)}
              change={12.5}
              icon={CurrencyDollarIcon}
              color="green"
            />
            <StatCard
              title="Total Invoices"
              value={analyticsData?.rawData?.overview?.activeInvoices || analyticsData?.rawData?.overview?.totalInvoices || 0}
              change={8.2}
              icon={DocumentTextIcon}
              color="blue"
            />
            <StatCard
              title="Active Clients"
              value={clients?.summary?.active_clients || 0}
              change={-2.1}
              icon={UsersIcon}
              color="purple"
            />
            <StatCard
              title="Estimate Conversion"
              value={formatPercentage(estimates?.summary?.conversion_rate)}
              change={15.3}
              icon={ArrowTrendingUpIcon}
              color="emerald"
            />
          </div>

          {/* Monthly Revenue Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Revenue Trends
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last {selectedTimeRange} months
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={invoices?.monthly_trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(value), name]}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={chartColors.primary} 
                  fill={chartColors.primary}
                  fillOpacity={0.1}
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invoice Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Invoice Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={invoices?.status_distribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(invoices?.status_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, `${name} invoices`]} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Estimate Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Estimate Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={estimates?.status_distribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(estimates?.status_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, `${name} estimates`]} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      )}

      {/* Financial Tab */}
      {selectedView === 'financial' && (
        <div className="space-y-6">
          {/* Financial KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(analyticsData?.rawData?.overview?.totalRevenue)}
              icon={CurrencyDollarIcon}
              color="green"
            />
            <StatCard
              title="Outstanding Amount"
              value={formatCurrency(invoices?.financial_summary?.totalOutstanding)}
              icon={DocumentTextIcon}
              color="yellow"
            />
            <StatCard
              title="Average Invoice"
              value={formatCurrency(invoices?.kpis?.average_invoice_value)}
              icon={ChartBarIcon}
              color="blue"
            />
            <StatCard
              title="Collection Rate"
              value={formatPercentage(invoices?.kpis?.collection_rate)}
              icon={ArrowTrendingUpIcon}
              color="purple"
            />
          </div>

          {/* Revenue vs Outstanding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Revenue vs Outstanding Amount
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={invoices?.monthly_trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(value), name]}
                />
                <Legend />
                <Bar dataKey="revenue" fill={chartColors.success} name="Revenue" />
                <Bar dataKey="paid" fill={chartColors.primary} name="Paid" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Clients by Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Clients by Revenue
            </h3>
            
            <div className="overflow-hidden">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={(invoices?.top_clients || []).slice(0, 8)} 
                  layout="horizontal"
                  margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    domain={[0, 'dataMax']}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} 
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={150}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
                  />
                  <Tooltip 
                    formatter={(value, name) => [formatCurrency(value), 'Total Paid']}
                    labelFormatter={(label) => `Client: ${label}`}
                  />
                  <Bar 
                    dataKey="totalPaid" 
                    fill={chartColors.primary}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}

      {/* Clients Tab */}
      {selectedView === 'clients' && (
        <div className="space-y-6">
          {/* Client KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Clients"
              value={clients?.summary?.total_clients || 0}
              icon={UsersIcon}
              color="blue"
            />
            <StatCard
              title="Active Clients"
              value={clients?.summary?.active_clients || 0}
              icon={UsersIcon}
              color="green"
            />
            <StatCard
              title="Average Client Value"
              value={formatCurrency(clients?.summary?.average_client_value)}
              icon={CurrencyDollarIcon}
              color="purple"
            />
            <StatCard
              title="Client Retention"
              value={formatPercentage(clients?.summary?.retention_rate)}
              icon={ArrowTrendingUpIcon}
              color="emerald"
            />
          </div>

          {/* Client Acquisition Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Client Acquisition Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={clients?.monthly_acquisition || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                />
                <Line 
                  type="monotone" 
                  dataKey="new_clients" 
                  stroke={chartColors.primary} 
                  strokeWidth={3}
                  name="New Clients"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Performing Clients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Top Performing Clients
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Invoices
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Performance Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {(clients?.client_performance || []).slice(0, 10).map((client, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {client.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(client.totalPaid)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {client.invoiceCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full" 
                              style={{width: `${Math.min((client.totalPaid / 1000) * 10, 100)}%`}}
                            ></div>
                          </div>
                          <span className="text-gray-900 dark:text-white">
                            {((client.totalPaid / 1000) * 10).toFixed(1)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}

      {/* Estimates Tab */}
      {selectedView === 'estimates' && (
        <div className="space-y-6">
          
          {/* Estimate KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Estimates"
              value={estimates?.summary?.total_estimates || 0}
              icon={DocumentTextIcon}
              color="blue"
            />
            <StatCard
              title="Conversion Rate"
              value={formatPercentage(estimates?.summary?.conversion_rate)}
              icon={ArrowTrendingUpIcon}
              color="green"
            />
            <StatCard
              title="Total Value"
              value={formatCurrency(estimates?.summary?.total_value)}
              icon={CurrencyDollarIcon}
              color="purple"
            />
            <StatCard
              title="Average Value"
              value={formatCurrency(estimates?.summary?.average_value)}
              icon={ChartBarIcon}
              color="emerald"
            />
          </div>

          {/* Estimate Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Estimate Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={estimates?.monthly_trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke={chartColors.secondary} 
                  fill={chartColors.secondary}
                  fillOpacity={0.1}
                  name="Estimates Count"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Aging Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Pending Estimates Aging
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estimate #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Days Pending
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {(estimates?.aging_analysis || []).slice(0, 10).map((estimate, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {estimate.estimate_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {estimate.client_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(estimate.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {estimate.days_pending} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          estimate.is_expired 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {estimate.is_expired ? 'Expired' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Reports;