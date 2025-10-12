import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [platformSettings, setPlatformSettings] = useState(null);
  const [pricingSettings, setPricingSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check admin access
  useEffect(() => {
    if (!user?.is_staff && !user?.is_superuser) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const [statsData, settingsData] = await Promise.all([
          adminService.getPlatformStats(),
          adminService.getPlatformSettings()
        ]);
        setStats(statsData);
        setPlatformSettings(settingsData);
      } else if (activeTab === 'users') {
        const data = await adminService.getAllUsers();
        setUsers(data.users);
      } else if (activeTab === 'clients') {
        const data = await adminService.getAllClients();
        setClients(data.clients);
      } else if (activeTab === 'settings') {
        const settingsData = await adminService.getPlatformSettings();
        setPlatformSettings(settingsData);
      } else if (activeTab === 'pricing') {
        const pricingData = await adminService.getPricingSettings();
        setPricingSettings(pricingData.settings);
      }
    } catch (error) {
      console.error('Admin Dashboard Error:', error);
      console.error('Error Response:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlatformFee = async (newFee, description) => {
    try {
      await adminService.updatePlatformSettings({
        platform_fee_percentage: newFee,
        fee_description: description
      });
      toast.success('Platform fee updated successfully');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to update platform fee');
    }
  };

  const handleToggleUserActive = async (userId, isActive) => {
    try {
      await adminService.updateUser(userId, { is_active: !isActive });
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully`);
      await loadDashboardData();
    } catch (error) {
      toast.error('Failed to update user');
      console.error('Toggle user error:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully');
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleUpdatePricing = async (pricingData) => {
    try {
      await adminService.updatePricingSettings(pricingData);
      toast.success('Pricing updated successfully');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to update pricing');
      console.error('Update pricing error:', error);
    }
  };

  if (loading && !stats && !users.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'users', name: 'Users', icon: '👥' },
            { id: 'clients', name: 'Clients', icon: '🏢' },
            { id: 'pricing', name: 'Pricing', icon: '💰' },
            { id: 'settings', name: 'Platform Settings', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-all
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.users.total}
                subtitle={`${stats.users.active} active`}
                icon="👥"
                color="blue"
              />
              <StatCard
                title="Total Clients"
                value={stats.clients.total}
                icon="🏢"
                color="green"
              />
              <StatCard
                title="Total Invoices"
                value={stats.invoices.total}
                subtitle={`${stats.invoices.paid} paid`}
                icon="📄"
                color="purple"
              />
              <StatCard
                title="Platform Revenue"
                value={`$${stats.platform.estimated_revenue.toFixed(2)}`}
                subtitle={`${stats.platform.current_fee}% fee`}
                icon="💰"
                color="yellow"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Users</h3>
                <div className="space-y-3">
                  {stats.recent_activity.users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-900 dark:text-gray-100">{user.email}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(user.joined).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Invoices */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Invoices</h3>
                <div className="space-y-3">
                  {stats.recent_activity.invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-900 dark:text-gray-100">{invoice.number}</span>
                      <span className="text-sm font-semibold text-green-600">${invoice.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Users ({users.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stats</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((userItem) => (
                    <tr key={userItem.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                            {userItem.first_name?.[0] || userItem.email[0].toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{userItem.first_name} {userItem.last_name}</div>
                            <div className="text-sm text-gray-500">{userItem.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userItem.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userItem.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {userItem.is_superuser && <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full mr-1">Super</span>}
                        {userItem.is_staff && <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Staff</span>}
                        {!userItem.is_staff && !userItem.is_superuser && <span className="text-sm text-gray-500">User</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userItem.stats.clients} clients, {userItem.stats.invoices} invoices
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(userItem.date_joined).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {userItem.email === user?.email ? (
                          <span className="text-gray-400 text-xs italic">You (cannot modify)</span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleUserActive(userItem.id, userItem.is_active)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-3"
                            >
                              {userItem.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            {userItem.is_superuser === false && (
                              <button
                                onClick={() => handleDeleteUser(userItem.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Clients ({clients.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stats</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Billed</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</div>
                        {client.company && <div className="text-sm text-gray-500">{client.company}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.owner.name}
                        <div className="text-xs text-gray-400">{client.owner.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{client.email}</div>
                        <div className="text-sm text-gray-500">{client.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.stats.invoices} invoices
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ${client.stats.total_billed.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && pricingSettings && (
          <PricingManagementForm
            settings={pricingSettings}
            onUpdate={handleUpdatePricing}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && platformSettings && (
          <PlatformSettingsForm
            settings={platformSettings}
            onUpdate={handleUpdatePlatformFee}
          />
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

// Platform Settings Form Component
const PlatformSettingsForm = ({ settings, onUpdate }) => {
  const [fee, setFee] = useState(settings.platform_fee_percentage);
  const [description, setDescription] = useState(settings.fee_description || '');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(
      fee !== settings.platform_fee_percentage ||
      description !== (settings.fee_description || '')
    );
  }, [fee, description, settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(fee, description);
    setHasChanges(false);
  };

  return (
    <div className="max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Platform Fee Configuration</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Platform Fee Percentage (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={fee}
              onChange={(e) => setFee(parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-sm text-gray-500 mt-1">Current: {settings.platform_fee_percentage}%</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fee Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Black Friday Special - 0.5% fee"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Fee Calculator Preview */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Fee Calculator Preview</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {[100, 500, 1000].map((amount) => {
                const platformCut = (amount * fee / 100).toFixed(2);
                const serviceCut = (amount - platformCut).toFixed(2);
                return (
                  <div key={amount} className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                    <div className="font-semibold text-gray-900 dark:text-white">${amount}</div>
                    <div className="text-xs text-green-600 mt-1">Platform: ${platformCut}</div>
                    <div className="text-xs text-blue-600">Provider: ${serviceCut}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={!hasChanges}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {hasChanges ? 'Save Changes' : 'No Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Pricing Management Form Component
const PricingManagementForm = ({ settings, onUpdate }) => {
  const [basePrices, setBasePrices] = useState({
    weekly: settings.weekly_base_price,
    monthly: settings.monthly_base_price,
    yearly: settings.yearly_base_price
  });
  const [discount, setDiscount] = useState({
    enabled: settings.discount_enabled,
    percentage: settings.discount_percentage,
    startDate: settings.discount_start_date ? settings.discount_start_date.split('T')[0] : '',
    endDate: settings.discount_end_date ? settings.discount_end_date.split('T')[0] : '',
    description: settings.discount_description || ''
  });
  const [trialDays, setTrialDays] = useState(settings.trial_days);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed =
      basePrices.weekly !== settings.weekly_base_price ||
      basePrices.monthly !== settings.monthly_base_price ||
      basePrices.yearly !== settings.yearly_base_price ||
      discount.enabled !== settings.discount_enabled ||
      discount.percentage !== settings.discount_percentage ||
      discount.description !== (settings.discount_description || '') ||
      trialDays !== settings.trial_days;
    setHasChanges(changed);
  }, [basePrices, discount, trialDays, settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      weekly_base_price: parseFloat(basePrices.weekly),
      monthly_base_price: parseFloat(basePrices.monthly),
      yearly_base_price: parseFloat(basePrices.yearly),
      discount_enabled: discount.enabled,
      discount_percentage: parseFloat(discount.percentage),
      discount_start_date: discount.startDate || null,
      discount_end_date: discount.endDate || null,
      discount_description: discount.description,
      trial_days: parseInt(trialDays)
    };
    onUpdate(data);
    setHasChanges(false);
  };

  const calculateDiscountedPrice = (basePrice) => {
    if (!discount.enabled) return basePrice;
    const discountDecimal = discount.percentage / 100;
    return (basePrice * (1 - discountDecimal)).toFixed(2);
  };

  return (
    <div className="max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Base Pricing Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">💵</span> Base Subscription Pricing
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weekly Plan
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={basePrices.weekly}
                  onChange={(e) => setBasePrices({...basePrices, weekly: e.target.value})}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {discount.enabled && (
                  <span className="text-green-600 font-medium">
                    → ${calculateDiscountedPrice(basePrices.weekly)}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monthly Plan
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={basePrices.monthly}
                  onChange={(e) => setBasePrices({...basePrices, monthly: e.target.value})}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {discount.enabled && (
                  <span className="text-green-600 font-medium">
                    → ${calculateDiscountedPrice(basePrices.monthly)}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Yearly Plan
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={basePrices.yearly}
                  onChange={(e) => setBasePrices({...basePrices, yearly: e.target.value})}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {discount.enabled && (
                  <span className="text-green-600 font-medium">
                    → ${calculateDiscountedPrice(basePrices.yearly)}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Free Trial Period (Days)
              </label>
              <input
                type="number"
                min="0"
                max="90"
                value={trialDays}
                onChange={(e) => setTrialDays(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </form>
        </div>

        {/* Promotional Discount Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">🎉</span> Promotional Discounts
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Enable Discount</span>
                <p className="text-xs text-gray-500 mt-1">Activate promotional pricing</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={discount.enabled}
                  onChange={(e) => setDiscount({...discount, enabled: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {discount.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={discount.percentage}
                    onChange={(e) => setDiscount({...discount, percentage: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 50 for 50% off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campaign Description
                  </label>
                  <input
                    type="text"
                    value={discount.description}
                    onChange={(e) => setDiscount({...discount, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Summer Sale - 50% off for 4 months"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={discount.startDate}
                      onChange={(e) => setDiscount({...discount, startDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={discount.endDate}
                      onChange={(e) => setDiscount({...discount, endDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Active Promotion Badge */}
                {settings.is_discount_active && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        Promotion Currently Active
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Current Customer-Facing Prices
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Weekly</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              ${discount.enabled ? calculateDiscountedPrice(basePrices.weekly) : basePrices.weekly}
            </div>
            {discount.enabled && (
              <div className="text-xs text-gray-500 line-through mt-1">${basePrices.weekly}</div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly</div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              ${discount.enabled ? calculateDiscountedPrice(basePrices.monthly) : basePrices.monthly}
            </div>
            {discount.enabled && (
              <div className="text-xs text-gray-500 line-through mt-1">${basePrices.monthly}</div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Yearly</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              ${discount.enabled ? calculateDiscountedPrice(basePrices.yearly) : basePrices.yearly}
            </div>
            {discount.enabled && (
              <div className="text-xs text-gray-500 line-through mt-1">${basePrices.yearly}</div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={!hasChanges}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {hasChanges ? 'Save Pricing Changes' : 'No Changes'}
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
