import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiMapPin, FiCalendar, FiPhone, FiMessageCircle, FiFlag, FiEdit2, FiTrash2, FiCheckCircle, FiArrowLeft, FiEye } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { getItemById, deleteItem, updateItem } from '../services/itemService';
import { getOrCreateConversation } from '../services/messageService';
import { submitReport } from '../services/adminService';
import useAuthStore from '../store/authStore';
import ClaimModal from '../components/ClaimModal';
import ItemCard from '../components/ItemCard';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ItemDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDesc, setReportDesc] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['item', id],
    queryFn: async () => (await getItemById(id)).data,
  });

  const item = data?.item;
  const related = data?.related || [];

  const deleteMutation = useMutation({
    mutationFn: () => deleteItem(id),
    onSuccess: () => {
      toast.success('Item deleted successfully!');
      qc.invalidateQueries(['items']);
      navigate('/dashboard');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const resolveMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('status', 'resolved');
      return updateItem(id, fd);
    },
    onSuccess: () => {
      toast.success('Item marked as resolved!');
      qc.invalidateQueries(['item', id]);
    },
  });

  const reportMutation = useMutation({
    mutationFn: () => submitReport({ itemId: id, reason: reportReason, description: reportDesc }),
    onSuccess: () => {
      toast.success('Report submitted. We will review it.');
      setShowReportModal(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Already reported'),
  });

  const startChatMutation = useMutation({
    mutationFn: () => getOrCreateConversation({ participantId: item.userId._id, itemId: id }),
    onSuccess: (res) => {
      navigate(`/messages/${res.data.conversation._id}`);
    },
    onError: () => toast.error('Failed to start chat'),
  });

  const isOwner = user && item && item.userId._id === user._id;

  if (isLoading) return <div className="min-h-screen pt-24 flex justify-center"><Spinner size="xl" /></div>;
  if (isError || !item) return (
    <div className="min-h-screen pt-24 flex flex-col items-center gap-4">
      <p className="text-error text-lg">Item not found.</p>
      <Link to="/browse" className="btn btn-primary">Browse Items</Link>
    </div>
  );

  return (
    <div className="pt-20 pb-10 min-h-screen">
      <div className="container-custom max-w-5xl">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-400 hover:text-dark-50 mb-6 transition-colors">
          <FiArrowLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="glass-card overflow-hidden">
              <div className="relative h-64 sm:h-80 bg-dark-700">
                <img
                  src={item.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title)}&background=6366f1&color=fff&size=800`}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title)}&background=6366f1&color=fff&size=800`; }}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant={item.type}>{item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}</Badge>
                  <Badge variant={item.status}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Badge>
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-dark-800/80 rounded-full px-2 py-1 text-xs text-dark-300">
                  <FiEye size={12} /> {item.views}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-sm text-primary-400 font-medium">{item.category?.icon} {item.category?.name}</span>
                </div>
                <h1 className="text-2xl font-bold text-dark-50 mb-4">{item.title}</h1>
                <p className="text-dark-300 text-sm leading-relaxed whitespace-pre-wrap">{item.description}</p>

                <div className="divider" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <FiMapPin className="text-primary-400 mt-0.5 flex-shrink-0" size={16} />
                    <div>
                      <p className="text-xs text-dark-500 mb-0.5">Location</p>
                      <p className="text-dark-200 text-sm">{item.location?.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiCalendar className="text-primary-400 mt-0.5 flex-shrink-0" size={16} />
                    <div>
                      <p className="text-xs text-dark-500 mb-0.5">Date {item.type === 'lost' ? 'Lost' : 'Found'}</p>
                      <p className="text-dark-200 text-sm">{format(new Date(item.dateLostOrFound), 'MMMM d, yyyy')}</p>
                    </div>
                  </div>
                </div>

                {/* Owner actions */}
                {isOwner && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to={`/edit-listing/${item._id}`} className="btn btn-outline btn-sm gap-2">
                      <FiEdit2 size={14} /> Edit
                    </Link>
                    {item.status !== 'resolved' && (
                      <button onClick={() => resolveMutation.mutate()} className="btn btn-sm bg-success/10 text-success border border-success/20 hover:bg-success/20 gap-2" disabled={resolveMutation.isPending}>
                        <FiCheckCircle size={14} /> Mark Resolved
                      </button>
                    )}
                    <button onClick={() => { if (window.confirm('Delete this item?')) deleteMutation.mutate(); }} className="btn btn-danger btn-sm gap-2" disabled={deleteMutation.isPending}>
                      <FiTrash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 flex flex-col gap-4"
          >
            {/* Owner card */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-dark-200 mb-4 text-sm">
                {item.type === 'lost' ? 'Posted By' : 'Found By'}
              </h3>
              <div className="flex items-center gap-3 mb-4">
                {item.userId?.avatar ? (
                  <img src={item.userId.avatar} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-primary-500/30" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                    {item.userId?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-dark-100">{item.userId?.name}</p>
                  <p className="text-dark-400 text-xs">Campus Member</p>
                </div>
              </div>

              {/* Action buttons */}
              {!isOwner && isAuthenticated && item.status === 'active' && (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowClaimModal(true)}
                    className="btn btn-primary w-full gap-2"
                    id="claim-item-btn"
                  >
                    📋 Submit a Claim
                  </button>

                  <button
                    onClick={() => startChatMutation.mutate()}
                    disabled={startChatMutation.isPending}
                    className="btn btn-outline w-full gap-2"
                    id="contact-chat-btn"
                  >
                    {startChatMutation.isPending ? <Spinner size="sm" /> : <FiMessageCircle size={16} />}
                    Send Message
                  </button>

                  {item.userId?.phone && (
                    <a
                      href={`https://wa.me/${item.userId.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn w-full gap-2 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/20"
                      id="whatsapp-btn"
                    >
                      <FaWhatsapp size={18} /> WhatsApp
                    </a>
                  )}
                </div>
              )}

              {!isAuthenticated && (
                <div className="text-center py-3">
                  <p className="text-dark-400 text-sm mb-3">Sign in to contact or claim</p>
                  <Link to="/login" className="btn btn-primary w-full">Login to Claim</Link>
                </div>
              )}

              {item.status !== 'active' && (
                <div className="text-center py-3 bg-dark-600/50 rounded-xl">
                  <p className="text-dark-400 text-sm">This item is no longer active</p>
                </div>
              )}
            </div>

            {/* Report */}
            {isAuthenticated && !isOwner && (
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 text-dark-500 hover:text-error text-sm transition-colors self-start"
                id="report-item-btn"
              >
                <FiFlag size={14} /> Report this listing
              </button>
            )}
          </motion.div>
        </div>

        {/* Related items */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-dark-50 mb-6">Similar Items</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((rel, i) => <ItemCard key={rel._id} item={rel} index={i} />)}
            </div>
          </div>
        )}
      </div>

      {/* Claim Modal */}
      <ClaimModal isOpen={showClaimModal} onClose={() => setShowClaimModal(false)} item={item} />

      {/* Report Modal */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Report This Listing" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Reason</label>
            <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="input">
              <option value="spam">Spam</option>
              <option value="fake">Fake listing</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="duplicate">Duplicate post</option>
              <option value="scam">Scam attempt</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Additional details</label>
            <textarea rows={3} className="input resize-none" value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} placeholder="Optional description..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowReportModal(false)} className="btn btn-outline flex-1">Cancel</button>
            <button onClick={() => reportMutation.mutate()} disabled={reportMutation.isPending} className="btn btn-danger flex-1">
              {reportMutation.isPending ? <Spinner size="sm" /> : 'Submit Report'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ItemDetail;
