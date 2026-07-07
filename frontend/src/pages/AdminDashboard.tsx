import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_ALL_USERS, GET_DASHBOARD_STATS } from '../api/graphql/queries';
import { DELETE_USER, UPDATE_USER_ROLE } from '../api/graphql/mutations';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import type { GraphQLUser, DashboardStatsData } from '../api/graphql/types';

interface AdminDashboardProps {
  onNavigate: (page: 'login' | 'register' | 'user-dashboard' | 'admin-dashboard' | 'cv-builder') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, logout, loadUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity' | 'settings'>('overview');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Fetch all users
  const { data: usersData, refetch: refetchUsers } = useQuery<{ allUsers: GraphQLUser[] }>(GET_ALL_USERS, {
    fetchPolicy: 'network-only',
  });

  // Fetch dashboard stats
  const { data: statsData, loading: statsLoading } = useQuery<{ dashboardStats: DashboardStatsData }>(GET_DASHBOARD_STATS, {
    fetchPolicy: 'network-only',
  });

  // Delete user mutation
  const [deleteUserMutation] = useMutation(DELETE_USER, {
    onCompleted: () => refetchUsers(),
  });

  // Update user role mutation
  const [updateUserRoleMutation] = useMutation(UPDATE_USER_ROLE, {
    onCompleted: () => refetchUsers(),
  });

  const users = usersData?.allUsers || [];
  const stats = statsData?.dashboardStats;

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUserMutation({ variables: { id: userId } });
    setShowDeleteModal(null);
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await updateUserRoleMutation({ variables: { id: userId, role: newRole } });
  };

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? users.length, change: '+12%', color: 'blue' },
    { label: 'Total CVs', value: stats?.totalCVs ?? '-', change: '+28%', color: 'green' },
    { label: 'Active Today', value: stats?.activeToday ?? '-', change: '+5%', color: 'purple' },
    { label: 'Published CVs', value: stats?.publishedCvs ?? '-', change: '+18%', color: 'amber' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">ResumeForge Administration</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">Administrator</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('user-dashboard')}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium"
              >
                User View
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto hide-scrollbar">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'activity', label: 'Activity', icon: '📈' },
              { id: 'settings', label: 'Settings', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat) => (
                <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <span className="text-xs text-green-600 font-medium bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {statsLoading ? (
                      <svg className="animate-spin w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* User Growth Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Growth</h3>
                {stats?.userGrowthData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={stats.userGrowthData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCvs" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                      <Legend />
                      <Area type="monotone" dataKey="users" stroke="#2563eb" fillOpacity={1} fill="url(#colorUsers)" name="Users" />
                      <Area type="monotone" dataKey="cvs" stroke="#059669" fillOpacity={1} fill="url(#colorCvs)" name="CVs Created" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-400">
                    {statsLoading ? 'Loading chart data...' : 'No data available'}
                  </div>
                )}
              </div>

              {/* Template Usage Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Template Usage</h3>
                {stats?.templateUsageData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.templateUsageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {stats.templateUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-400">
                    {statsLoading ? 'Loading chart data...' : 'No data available'}
                  </div>
                )}
              </div>
            </div>

            {/* Daily Activity Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Activity</h3>
              {stats?.dailyActivityData ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.dailyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    <Legend />
                    <Bar dataKey="logins" fill="#2563eb" radius={[4, 4, 0, 0]} name="Logins" />
                    <Bar dataKey="cvsCreated" fill="#059669" radius={[4, 4, 0, 0]} name="CVs Created" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  {statsLoading ? 'Loading chart data...' : 'No data available'}
                </div>
              )}
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">{users.length} users total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                            u.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-orange-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                          }`}>
                            {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{u.firstName} {u.lastName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          u.role === 'admin' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {u.role === 'admin' ? '🔑 Admin' : '👤 User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {u.id !== user?.id && (
                            <>
                              <button
                                onClick={() => handleToggleRole(u.id, u.role)}
                                className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                              </button>
                              <button
                                onClick={() => setShowDeleteModal(u.id)}
                                className="px-3 py-1 text-xs font-medium bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {u.id === user?.id && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 italic">You</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent System Activity</h3>
            <div className="space-y-4">
              {stats?.recentActivity?.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-gray-100 dark:border-gray-700">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    activity.type === 'create' ? 'bg-green-100 dark:bg-green-900/30' :
                    activity.type === 'publish' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    activity.type === 'admin' ? 'bg-red-100 dark:bg-red-900/30' :
                    activity.type === 'auth' ? 'bg-purple-100 dark:bg-purple-900/30' :
                    activity.type === 'download' ? 'bg-amber-100 dark:bg-amber-900/30' :
                    'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {activity.type === 'create' ? '📝' :
                     activity.type === 'publish' ? '🚀' :
                     activity.type === 'admin' ? '🔑' :
                     activity.type === 'auth' ? '👤' :
                     activity.type === 'download' ? '📥' :
                     activity.type === 'delete' ? '🗑️' :
                     activity.type === 'import' ? '🔗' : '✏️'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-semibold">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{activity.time}</span>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-400">
                  {statsLoading ? 'Loading activity...' : 'No recent activity'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Maintenance Mode</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Temporarily disable public access</p>
                  </div>
                  <button className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative transition-colors">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow transition-transform"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Send email alerts for new registrations</p>
                  </div>
                  <button className="w-12 h-6 bg-blue-600 rounded-full relative transition-colors">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow transition-transform"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Allow Registration</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enable new user signups</p>
                  </div>
                  <button className="w-12 h-6 bg-blue-600 rounded-full relative transition-colors">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow transition-transform"></div>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">GraphQL Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GraphQL Endpoint</label>
                  <input
                    type="text"
                    value="/graphql"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    readOnly
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  GraphQL endpoint connected (proxied to Django backend)
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">Delete User?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
              This action cannot be undone. The user will lose access to their account and all associated data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteModal)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
