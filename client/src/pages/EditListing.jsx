import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiArrowLeft } from 'react-icons/fi';
import { getItemById, updateItem } from '../services/itemService';
import { getCategories } from '../services/categoryService';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: itemData, isLoading } = useQuery({
    queryKey: ['item', id],
    queryFn: async () => (await getItemById(id)).data,
  });

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await getCategories()).data,
    staleTime: Infinity,
  });

  const item = itemData?.item;
  const categories = catData?.categories || [];

  const { register, handleSubmit, formState: { errors } } = useForm({
    values: item ? {
      title: item.title,
      description: item.description,
      category: item.category?._id,
      location: item.location?.address,
      dateLostOrFound: item.dateLostOrFound ? format(new Date(item.dateLostOrFound), 'yyyy-MM-dd') : '',
      contactMethod: item.contactMethod,
      phone: item.phone,
      status: item.status,
    } : {},
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, v); });
      if (data.image?.[0]) fd.set('image', data.image[0]);
      return updateItem(id, fd);
    },
    onSuccess: () => {
      toast.success('Item updated!');
      qc.invalidateQueries(['item', id]);
      qc.invalidateQueries(['my-items']);
      navigate(`/items/${id}`);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  if (isLoading) return <div className="min-h-screen pt-24 flex justify-center"><Spinner size="xl" /></div>;

  return (
    <div className="pt-24 pb-10 min-h-screen">
      <div className="container-custom max-w-2xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-400 hover:text-dark-50 mb-6 transition-colors">
          <FiArrowLeft size={16} /> Back
        </button>

        <h1 className="page-title mb-8">Edit Listing</h1>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(mutation.mutate)} className="space-y-5" id="edit-listing-form">
            <div>
              <label className="label">Title</label>
              <input type="text" className="input" {...register('title', { required: true })} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" {...register('category', { required: true })}>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea rows={4} className="input resize-none" {...register('description', { required: true })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Location</label>
                <input type="text" className="input" {...register('location', { required: true })} />
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" className="input" {...register('dateLostOrFound')} />
              </div>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" {...register('status')}>
                <option value="active">Active</option>
                <option value="claimed">Claimed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="label">Update Image (optional)</label>
              <input type="file" accept="image/*" className="input py-2" {...register('image')} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate(-1)} className="btn btn-outline flex-1">Cancel</button>
              <button type="submit" className="btn btn-primary flex-1" disabled={mutation.isPending} id="save-edit-btn">
                {mutation.isPending ? <Spinner size="sm" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditListing;
