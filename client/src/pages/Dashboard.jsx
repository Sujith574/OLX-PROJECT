import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiUser, FiPackage, FiFileText, FiBell, FiSettings, FiEdit2, FiTrash2, FiCheckCircle, FiPlus } from 'react-icons/fi';
import { getMyItems, deleteItem, updateItem } from '../services/itemService';
import { getMyClaims, getReceivedClaims, updateClaimStatus } from '../services/claimService';
import { getNotifications, markAllRead } from '../services/messageService';
import { updateProfile, changePassword } from '../services/authService';
import useAuthStore from '../store/authStore';
import ItemCard from '../components/ItemCard';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const TABS = [
  { id: 'profile', label: 'Profile', icon: FiUser },
  { id: 'posts', label: 'My Posts', icon: FiPackage },
  { id: 'claims', label: 'My Claims', icon: FiFileText },
  { id: 'received', label: 'Received Claims', icon: FiFileText },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
  { id: 'settings', label: 'Settings', icon: FiSettings },
];

// ===== Profile Tab =====
const ProfileTab = () => {
  const { user, updateUser } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: user });
  const mutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v) fd.append(k, v); });
      return updateProfile(fd);
    },
    onSuccess: (res) => { updateUser(res.data.user); toast.success('Profile updated!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  return (
    <div className="glass-card p-6 max-w-lg">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-bold text-dark-50">{user?.name}</h2>
          <p className="text-dark-400 text-sm">{user?.email}</p>
          <Badge variant={user?.role}>{user?.role}</Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit(mutation.mutate)} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input type="text" className="input" {...register('name', { required: true })} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input type="tel" className="input" {...register('phone')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">College</label>
            <input type="text" className="input" {...register('college')} />
          </div>
          <div>
            <label className="label">Department</label>
            <input type="text" className="input" {...register('department')} />
          </div>
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea rows={2} className="input resize-none" {...register('bio')} placeholder="Tell us a bit about yourself..." />
        </div>
        <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
          {mutation.isPending ? <Spinner size="sm" /> : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

// ===== My Posts Tab =====
const MyPostsTab = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['my-items'], queryFn: async () => (await getMyItems()).data });
  const items = data?.items || [];

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => { toast.success('Item deleted!'); qc.invalidateQueries(['my-items']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-dark-50">My Listings ({items.length})</h2>
        <Link to="/add-listing" className="btn btn-primary btn-sm gap-1.5"><FiPlus size={14} /> New Post</Link>
      </div>
      {items.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-dark-400 mb-4">You haven't posted any items yet.</p>
          <Link to="/add-listing" className="btn btn-primary">Post Your First Item</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <div key={item._id} className="relative">
              <ItemCard item={item} index={i} />
              <div className="absolute top-2 right-2 flex gap-1.5">
                <Link to={`/edit-listing/${item._id}`} className="p-1.5 bg-dark-800/90 rounded-lg text-dark-300 hover:text-primary-400 transition-colors" id={`edit-item-${item._id}`}>
                  <FiEdit2 size={14} />
                </Link>
                <button
                  onClick={() => { if (window.confirm('Delete?')) deleteMutation.mutate(item._id); }}
                  className="p-1.5 bg-dark-800/90 rounded-lg text-dark-300 hover:text-error transition-colors"
                  id={`delete-item-${item._id}`}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== My Claims Tab =====
const MyClaimsTab = () => {
  const [qrClaim, setQrClaim] = useState(null);
  const { data, isLoading } = useQuery({ queryKey: ['my-claims'], queryFn: async () => (await getMyClaims()).data });
  const claims = data?.claims || [];

  const statusColor = { pending: 'pending', approved: 'approved', rejected: 'rejected' };

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div>
      <h2 className="text-lg font-bold text-dark-50 mb-5">My Submitted Claims ({claims.length})</h2>
      {claims.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-dark-400">You haven't submitted any claims yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => (
            <div key={claim._id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <img
                    src={claim.itemId?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(claim.itemId?.title || 'Item')}&background=6366f1&color=fff&size=100`}
                    alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=Item&background=6366f1&color=fff`}
                  />
                  <div>
                    <Link to={`/items/${claim.itemId?._id}`} className="font-semibold text-dark-100 hover:text-primary-400 text-sm transition-colors">
                      {claim.itemId?.title}
                    </Link>
                    <p className="text-dark-500 text-xs mt-0.5">{format(new Date(claim.createdAt), 'MMM d, yyyy')}</p>
                    <p className="text-dark-400 text-xs mt-1 line-clamp-1">{claim.message}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={statusColor[claim.status]}>{claim.status}</Badge>
                  {claim.status === 'approved' && claim.qrCode && (
                    <button onClick={() => setQrClaim(claim)} className="btn btn-sm bg-success/10 text-success border border-success/20">
                      📱 QR Code
                    </button>
                  )}
                </div>
              </div>
              {claim.adminNote && (
                <div className="mt-3 p-2 bg-dark-600/30 rounded-lg">
                  <p className="text-xs text-dark-400"><span className="font-medium text-dark-300">Note:</span> {claim.adminNote}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      <Modal isOpen={!!qrClaim} onClose={() => setQrClaim(null)} title="Claim Verification QR Code" size="sm">
        {qrClaim && (
          <div className="text-center">
            <p className="text-dark-400 text-sm mb-5">Show this QR code when collecting your item for verification.</p>
            <div className="bg-white p-4 rounded-xl inline-block mx-auto">
              <QRCodeSVG value={qrClaim.qrCode} size={200} />
            </div>
            <p className="text-dark-500 text-xs mt-4">Claim ID: {qrClaim._id}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ===== Received Claims Tab =====
const ReceivedClaimsTab = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['received-claims'], queryFn: async () => (await getReceivedClaims()).data });
  const claims = data?.claims || [];

  const updateMutation = useMutation({
    mutationFn: ({ id, status, adminNote }) => updateClaimStatus(id, { status, adminNote }),
    onSuccess: () => { toast.success('Claim updated!'); qc.invalidateQueries(['received-claims']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div>
      <h2 className="text-lg font-bold text-dark-50 mb-5">Claims on My Items ({claims.length})</h2>
      {claims.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-dark-400">No claims received yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim._id} className="glass-card p-5">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                    {claim.claimantId?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-dark-100 text-sm">{claim.claimantId?.name}</p>
                    <p className="text-dark-500 text-xs">{claim.claimantId?.email}</p>
                  </div>
                </div>
                <Badge variant={claim.status}>{claim.status}</Badge>
              </div>

              <div className="mt-3 space-y-2">
                <div className="p-3 bg-dark-600/30 rounded-lg">
                  <p className="text-xs font-medium text-dark-300 mb-1">Message:</p>
                  <p className="text-dark-400 text-sm">{claim.message}</p>
                </div>
                <div className="p-3 bg-dark-600/30 rounded-lg">
                  <p className="text-xs font-medium text-dark-300 mb-1">Proof of Ownership:</p>
                  <p className="text-dark-400 text-sm">{claim.proofDescription}</p>
                </div>
              </div>

              {claim.status === 'pending' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => updateMutation.mutate({ id: claim._id, status: 'approved' })}
                    disabled={updateMutation.isPending}
                    className="btn btn-sm bg-success/10 text-success border border-success/20 hover:bg-success/20 gap-1.5"
                    id={`approve-claim-${claim._id}`}
                  >
                    <FiCheckCircle size={14} /> Approve
                  </button>
                  <button
                    onClick={() => { const note = window.prompt('Reason for rejection (optional):'); updateMutation.mutate({ id: claim._id, status: 'rejected', adminNote: note || '' }); }}
                    disabled={updateMutation.isPending}
                    className="btn btn-danger btn-sm gap-1.5"
                    id={`reject-claim-${claim._id}`}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== Settings Tab =====
const SettingsTab = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => toast.success('Password changed successfully!'),
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to change password'),
  });

  return (
    <div className="glass-card p-6 max-w-md">
      <h2 className="text-lg font-bold text-dark-50 mb-5">Change Password</h2>
      <form onSubmit={handleSubmit(mutation.mutate)} className="space-y-4">
        <div>
          <label className="label">Current Password</label>
          <input type="password" className="input" placeholder="••••••••" {...register('currentPassword', { required: true })} />
        </div>
        <div>
          <label className="label">New Password</label>
          <input type="password" className="input" placeholder="Min 6 characters" {...register('newPassword', { required: true, minLength: 6 })} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
          {mutation.isPending ? <Spinner size="sm" /> : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

// ===== Main Dashboard =====
const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const { user } = useAuthStore();

  const TAB_CONTENT = {
    profile: <ProfileTab />,
    posts: <MyPostsTab />,
    claims: <MyClaimsTab />,
    received: <ReceivedClaimsTab />,
    settings: <SettingsTab />,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name}! 👋</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <aside className="lg:w-52 flex-shrink-0">
          <div className="glass-card p-3 flex lg:flex-col gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  activeTab === id
                    ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                    : 'text-dark-400 hover:text-dark-50 hover:bg-dark-600/50'
                }`}
                id={`tab-${id}`}
              >
                <Icon size={16} />
                <span className="hidden sm:block lg:block">{label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 min-w-0"
        >
          {TAB_CONTENT[activeTab] || <ProfileTab />}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
