import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/categoryService';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const ManageCategories = () => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await getCategories()).data,
  });

  const { register, handleSubmit, reset, setValue } = useForm();

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => { toast.success('Category created!'); qc.invalidateQueries(['categories']); setShowModal(false); reset(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => { toast.success('Category updated!'); qc.invalidateQueries(['categories']); setShowModal(false); setEditing(null); reset(); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => { toast.success('Category deleted!'); qc.invalidateQueries(['categories']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const openCreate = () => { setEditing(null); reset({ name: '', icon: '📦', description: '' }); setShowModal(true); };
  const openEdit = (cat) => { setEditing(cat); setValue('name', cat.name); setValue('icon', cat.icon); setValue('description', cat.description || ''); setShowModal(true); };

  const onSubmit = (data) => {
    if (editing) updateMutation.mutate({ id: editing._id, data });
    else createMutation.mutate(data);
  };

  const categories = data?.categories || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Manage Categories</h1>
          <p className="page-subtitle">{categories.length} categories</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary gap-2" id="add-category-btn">
          <FiPlus size={16} /> Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="glass-card p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <p className="font-semibold text-dark-100">{cat.name}</p>
                  <p className="text-dark-500 text-xs">{cat.description || 'No description'}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(cat)} className="p-1.5 text-dark-400 hover:text-primary-400 transition-colors" id={`edit-cat-${cat._id}`}>
                  <FiEdit2 size={15} />
                </button>
                <button
                  onClick={() => { if (window.confirm(`Delete "${cat.name}"?`)) deleteMutation.mutate(cat._id); }}
                  className="p-1.5 text-dark-400 hover:text-error transition-colors"
                  id={`delete-cat-${cat._id}`}
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }} title={editing ? 'Edit Category' : 'New Category'} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="category-form">
          <div>
            <label className="label">Icon (emoji)</label>
            <input type="text" className="input" placeholder="📦" {...register('icon', { required: true })} />
          </div>
          <div>
            <label className="label">Name</label>
            <input type="text" className="input" placeholder="Electronics" {...register('name', { required: true })} />
          </div>
          <div>
            <label className="label">Description</label>
            <input type="text" className="input" placeholder="Optional description" {...register('description')} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1" disabled={createMutation.isPending || updateMutation.isPending} id="save-category-btn">
              {createMutation.isPending || updateMutation.isPending ? <Spinner size="sm" /> : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageCategories;
