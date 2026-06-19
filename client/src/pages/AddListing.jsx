import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiUpload, FiX, FiMapPin, FiCalendar } from 'react-icons/fi';
import { createItem } from '../services/itemService';
import { getCategories } from '../services/categoryService';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const AddListing = () => {
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') || 'lost';
  const [previewImg, setPreviewImg] = useState(null);
  const fileRef = useRef(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await getCategories()).data,
    staleTime: Infinity,
  });

  const categories = catData?.categories || [];

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { type: defaultType },
  });

  const type = watch('type');

  const mutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') fd.append(k, v); });
      if (data.image?.[0]) fd.set('image', data.image[0]);
      return createItem(fd);
    },
    onSuccess: (res) => {
      toast.success('Item posted successfully!');
      qc.invalidateQueries(['items']);
      navigate(`/items/${res.data.item._id}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to post item'),
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <div className="pt-24 pb-10 min-h-screen">
      <div className="container-custom max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title mb-1">Post an Item</h1>
          <p className="page-subtitle mb-8">Help your campus community by reporting a lost or found item</p>

          <div className="glass-card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="add-listing-form">
              {/* Type selector */}
              <div>
                <label className="label">Item Type <span className="text-error">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {['lost', 'found'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setValue('type', t)}
                      className={`py-3 rounded-xl font-semibold text-sm transition-all border ${
                        type === t
                          ? t === 'lost'
                            ? 'bg-error/15 text-error border-error/30'
                            : 'bg-success/15 text-success border-success/30'
                          : 'text-dark-400 border-dark-600 hover:border-dark-500'
                      }`}
                      id={`type-${t}-btn`}
                    >
                      {t === 'lost' ? '🔴 I Lost Something' : '🟢 I Found Something'}
                    </button>
                  ))}
                </div>
                <input type="hidden" {...register('type', { required: true })} />
              </div>

              {/* Title */}
              <div>
                <label htmlFor="item-title" className="label">Title <span className="text-error">*</span></label>
                <input id="item-title" type="text" className={`input ${errors.title ? 'input-error' : ''}`}
                  placeholder="e.g., Black iPhone 14 with red case"
                  {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Min 3 characters' } })} />
                {errors.title && <p className="text-xs text-error mt-1">{errors.title.message}</p>}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="item-category" className="label">Category <span className="text-error">*</span></label>
                <select id="item-category" className={`input ${errors.category ? 'input-error' : ''}`}
                  {...register('category', { required: 'Category is required' })}>
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
                {errors.category && <p className="text-xs text-error mt-1">{errors.category.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="item-desc" className="label">Description <span className="text-error">*</span></label>
                <textarea id="item-desc" rows={4} className={`input resize-none ${errors.description ? 'input-error' : ''}`}
                  placeholder="Describe the item in detail — color, brand, unique marks, contents (for bags), serial number, etc."
                  {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'Min 10 characters' } })} />
                {errors.description && <p className="text-xs text-error mt-1">{errors.description.message}</p>}
              </div>

              {/* Location + Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="item-location" className="label">
                    <FiMapPin size={14} className="inline mr-1 text-primary-400" />
                    Location <span className="text-error">*</span>
                  </label>
                  <input id="item-location" type="text" className={`input ${errors.location ? 'input-error' : ''}`}
                    placeholder="e.g., Library, Block A canteen"
                    {...register('location', { required: 'Location is required' })} />
                  {errors.location && <p className="text-xs text-error mt-1">{errors.location.message}</p>}
                </div>
                <div>
                  <label htmlFor="item-date" className="label">
                    <FiCalendar size={14} className="inline mr-1 text-primary-400" />
                    Date {type === 'lost' ? 'Lost' : 'Found'} <span className="text-error">*</span>
                  </label>
                  <input id="item-date" type="date" className={`input ${errors.dateLostOrFound ? 'input-error' : ''}`}
                    max={new Date().toISOString().split('T')[0]}
                    {...register('dateLostOrFound', { required: 'Date is required' })} />
                  {errors.dateLostOrFound && <p className="text-xs text-error mt-1">{errors.dateLostOrFound.message}</p>}
                </div>
              </div>

              {/* Contact Method */}
              <div>
                <label className="label">Preferred Contact Method</label>
                <select className="input" id="contact-method" {...register('contactMethod')}>
                  <option value="chat">Internal Chat (Recommended)</option>
                  <option value="phone">WhatsApp / Phone</option>
                  <option value="email">Email</option>
                </select>
              </div>

              {/* Phone (optional) */}
              <div>
                <label htmlFor="item-phone" className="label">Phone Number (for WhatsApp)</label>
                <input id="item-phone" type="tel" className="input" placeholder="+91 98765 43210" {...register('phone')} />
              </div>

              {/* Image */}
              <div>
                <label className="label">Upload Image</label>
                <div
                  onClick={() => fileRef.current.click()}
                  className="relative border-2 border-dashed border-dark-600 rounded-xl p-6 text-center cursor-pointer hover:border-primary-500/50 transition-colors group"
                  id="image-upload-area"
                >
                  {previewImg ? (
                    <div className="relative">
                      <img src={previewImg} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPreviewImg(null); fileRef.current.value = ''; }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-error rounded-full flex items-center justify-center text-white"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FiUpload className="mx-auto mb-2 text-dark-500 group-hover:text-primary-400 transition-colors" size={28} />
                      <p className="text-dark-400 text-sm">Click to upload image</p>
                      <p className="text-dark-600 text-xs mt-1">PNG, JPG, WebP up to 5MB</p>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    {...register('image')}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => navigate(-1)} className="btn btn-outline flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={mutation.isPending} className="btn btn-primary flex-1" id="post-item-btn">
                  {mutation.isPending ? <><Spinner size="sm" /> Posting...</> : '🚀 Post Item'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddListing;
