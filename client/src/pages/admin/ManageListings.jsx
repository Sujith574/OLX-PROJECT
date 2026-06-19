import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiTrash2, FiEye, FiFlag } from 'react-icons/fi';
import { getAdminItems } from '../../services/adminService';
import { deleteItem } from '../../services/itemService';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ManageListings = () => {
  const [filter, setFilter] = useState({ status: '', type: '', isFlagged: '' });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-items', filter],
    queryFn: async () => (await getAdminItems(filter)).data,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => { toast.success('Item removed!'); qc.invalidateQueries(['admin-items']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const items = data?.items || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Manage Listings</h1>
        <p className="page-subtitle">{data?.total || 0} total listings</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-5 flex flex-wrap gap-3">
        <select className="input w-auto" value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })} id="filter-type">
          <option value="">All Types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
        <select className="input w-auto" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} id="filter-status">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="claimed">Claimed</option>
          <option value="resolved">Resolved</option>
        </select>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={!!filter.isFlagged} onChange={(e) => setFilter({ ...filter, isFlagged: e.target.checked })} className="rounded" />
          <span className="text-dark-300 text-sm">Flagged only</span>
        </label>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600/50">
                {['Item', 'Type', 'Status', 'Posted By', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-dark-400 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className={`border-b border-dark-700/30 hover:bg-dark-600/20 transition-colors ${item.isFlagged ? 'bg-error/5' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={item.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title)}&background=6366f1&color=fff&size=60`}
                        alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=Item&background=334155&color=fff`} />
                      <div>
                        <p className="text-dark-100 text-sm font-medium line-clamp-1">{item.title}</p>
                        {item.isFlagged && <span className="text-xs text-error flex items-center gap-1"><FiFlag size={10} /> Flagged</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant={item.type}>{item.type}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={item.status}>{item.status}</Badge></td>
                  <td className="px-4 py-3 text-dark-400 text-sm">{item.userId?.name}</td>
                  <td className="px-4 py-3 text-dark-500 text-xs">{format(new Date(item.createdAt), 'MMM d')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/items/${item._id}`} className="p-1.5 text-dark-400 hover:text-primary-400 transition-colors" title="View">
                        <FiEye size={15} />
                      </Link>
                      <button
                        onClick={() => { if (window.confirm('Delete this item?')) deleteMutation.mutate(item._id); }}
                        className="p-1.5 text-dark-400 hover:text-error transition-colors"
                        title="Delete"
                        id={`admin-delete-${item._id}`}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <div className="text-center py-12 text-dark-400">No items found.</div>}
        </div>
      )}
    </div>
  );
};

export default ManageListings;
