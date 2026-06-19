import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiEye, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { getReports, updateReport } from '../../services/adminService';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ManageReports = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => (await getReports()).data,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, adminNote }) => updateReport(id, { status, adminNote }),
    onSuccess: () => { toast.success('Report updated!'); qc.invalidateQueries(['admin-reports']); },
  });

  const reports = data?.reports || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Manage Reports</h1>
        <p className="page-subtitle">{reports.filter(r => r.status === 'pending').length} pending reports</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : reports.length === 0 ? (
        <div className="glass-card p-12 text-center text-dark-400">No reports yet.</div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report._id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={report.status === 'pending' ? 'pending' : report.status === 'reviewed' ? 'approved' : 'default'}>
                      {report.status}
                    </Badge>
                    <Badge variant="default">{report.reason}</Badge>
                  </div>
                  <Link to={`/items/${report.itemId?._id}`} className="text-dark-100 font-semibold hover:text-primary-400 transition-colors text-sm">
                    {report.itemId?.title}
                  </Link>
                  <p className="text-dark-500 text-xs mt-1">
                    Reported by <span className="text-dark-300">{report.reportedBy?.name}</span> — {format(new Date(report.createdAt), 'MMM d, yyyy')}
                  </p>
                  {report.description && <p className="text-dark-400 text-sm mt-2 bg-dark-600/30 rounded-lg p-2">{report.description}</p>}
                </div>

                {report.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        const note = window.prompt('Admin note (optional):') || '';
                        updateMutation.mutate({ id: report._id, status: 'reviewed', adminNote: note });
                      }}
                      className="btn btn-sm bg-success/10 text-success border border-success/20 gap-1"
                      id={`review-report-${report._id}`}
                    >
                      <FiCheckCircle size={13} /> Review & Flag
                    </button>
                    <button
                      onClick={() => updateMutation.mutate({ id: report._id, status: 'dismissed' })}
                      className="btn btn-sm bg-dark-600/50 text-dark-300 border border-dark-500 gap-1"
                      id={`dismiss-report-${report._id}`}
                    >
                      <FiXCircle size={13} /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageReports;
