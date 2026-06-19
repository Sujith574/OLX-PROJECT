import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiSearch, FiUserX, FiUserCheck } from 'react-icons/fi';
import { getAdminUsers, toggleBanUser } from '../../services/adminService';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', { search, page }],
    queryFn: async () => (await getAdminUsers({ search, page, limit: 20 })).data,
  });

  const banMutation = useMutation({
    mutationFn: toggleBanUser,
    onSuccess: () => { toast.success('User status updated!'); qc.invalidateQueries(['admin-users']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const users = data?.users || [];
  const total = data?.total || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">{total} registered users</p>
        </div>
      </div>

      <div className="glass-card p-4 mb-5">
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="input pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            id="user-search-input"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full" id="users-table">
            <thead>
              <tr className="border-b border-dark-600/50">
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-dark-400 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-dark-700/30 hover:bg-dark-600/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-dark-100 text-sm font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-dark-400 text-sm">{u.email}</td>
                  <td className="px-4 py-3"><Badge variant={u.role}>{u.role}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge variant={u.isBanned ? 'rejected' : 'approved'}>
                      {u.isBanned ? 'Banned' : 'Active'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-dark-500 text-xs">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => banMutation.mutate(u._id)}
                        disabled={banMutation.isPending}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${u.isBanned ? 'bg-success/10 text-success border border-success/20 hover:bg-success/20' : 'bg-error/10 text-error border border-error/20 hover:bg-error/20'}`}
                        id={`ban-user-${u._id}`}
                      >
                        {u.isBanned ? <><FiUserCheck size={13} /> Unban</> : <><FiUserX size={13} /> Ban</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12 text-dark-400">No users found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
