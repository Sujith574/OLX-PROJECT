import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { FiUsers, FiPackage, FiCheckCircle, FiAlertCircle, FiFileText, FiFlag } from 'react-icons/fi';
import { getAnalytics } from '../../services/adminService';
import Spinner from '../../components/ui/Spinner';

const COLORS = ['#6366f1', '#ef4444', '#22c55e', '#f59e0b'];

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className={`glass-card p-5 flex items-center gap-4`}>
    <div className={`${bg} ${color} p-3 rounded-xl flex-shrink-0`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-2xl font-extrabold text-dark-50">{value?.toLocaleString()}</p>
      <p className="text-dark-400 text-sm">{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => (await getAnalytics()).data,
    refetchInterval: 60000,
  });

  const analytics = data?.analytics;

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="xl" /></div>;

  // Process monthly data for chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = months.map((month, i) => {
    const monthNum = i + 1;
    const lost = analytics?.monthlyData?.find(d => d._id.month === monthNum && d._id.type === 'lost')?.count || 0;
    const found = analytics?.monthlyData?.find(d => d._id.month === monthNum && d._id.type === 'found')?.count || 0;
    return { month, lost, found };
  }).slice(Math.max(0, new Date().getMonth() - 5), new Date().getMonth() + 1);

  const pieData = [
    { name: 'Lost', value: analytics?.lostItems || 0 },
    { name: 'Found', value: analytics?.foundItems || 0 },
    { name: 'Resolved', value: analytics?.resolvedItems || 0 },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview and analytics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard icon={FiUsers} label="Total Users" value={analytics?.totalUsers} color="text-primary-400" bg="bg-primary-500/10" />
        <StatCard icon={FiPackage} label="Total Items" value={analytics?.totalItems} color="text-accent-400" bg="bg-accent-500/10" />
        <StatCard icon={FiCheckCircle} label="Active" value={analytics?.activeItems} color="text-info" bg="bg-info/10" />
        <StatCard icon={FiCheckCircle} label="Resolved" value={analytics?.resolvedItems} color="text-success" bg="bg-success/10" />
        <StatCard icon={FiFileText} label="Claims" value={analytics?.totalClaims} color="text-warning" bg="bg-warning/10" />
        <StatCard icon={FiFlag} label="Reports" value={analytics?.pendingReports} color="text-error" bg="bg-error/10" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly bar chart */}
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-semibold text-dark-100 mb-4">Monthly Listings (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
              <Bar dataKey="lost" fill="#ef4444" radius={[4, 4, 0, 0]} name="Lost" />
              <Bar dataKey="found" fill="#22c55e" radius={[4, 4, 0, 0]} name="Found" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-dark-100 mb-4">Lost vs Found vs Resolved</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Categories */}
      {analytics?.topCategories?.length > 0 && (
        <div className="glass-card p-5 mt-6">
          <h3 className="font-semibold text-dark-100 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {analytics.topCategories.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="text-xl w-8">{cat.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-dark-200">{cat.name}</span>
                    <span className="text-sm text-dark-400">{cat.count}</span>
                  </div>
                  <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                      style={{ width: `${(cat.count / (analytics.topCategories[0]?.count || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
