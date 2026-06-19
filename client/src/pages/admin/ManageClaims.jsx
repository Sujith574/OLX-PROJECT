import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getAdminClaims } from '../../services/adminService';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { format } from 'date-fns';

const ManageClaims = () => {
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-claims', status],
    queryFn: async () => (await getAdminClaims({ status })).data,
  });

  const claims = data?.claims || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Manage Claims</h1>
          <p className="page-subtitle">{data?.total || 0} total claims</p>
        </div>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)} id="claims-filter">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : claims.length === 0 ? (
        <div className="glass-card p-12 text-center text-dark-400">No claims found.</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600/50">
                {['Item', 'Claimant', 'Status', 'Proof', 'Date'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-dark-400 text-xs font-semibold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim._id} className="border-b border-dark-700/30 hover:bg-dark-600/20">
                  <td className="px-4 py-3">
                    <Link to={`/items/${claim.itemId?._id}`} className="text-dark-100 hover:text-primary-400 text-sm font-medium transition-colors">
                      {claim.itemId?.title}
                    </Link>
                    <Badge variant={claim.itemId?.type} className="ml-2">{claim.itemId?.type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-dark-300 text-sm">{claim.claimantId?.name}</td>
                  <td className="px-4 py-3"><Badge variant={claim.status}>{claim.status}</Badge></td>
                  <td className="px-4 py-3 text-dark-400 text-xs max-w-48 truncate">{claim.proofDescription}</td>
                  <td className="px-4 py-3 text-dark-500 text-xs">{format(new Date(claim.createdAt), 'MMM d, yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageClaims;
