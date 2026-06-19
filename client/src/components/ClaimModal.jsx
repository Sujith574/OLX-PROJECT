import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitClaim } from '../services/claimService';
import Modal from './ui/Modal';
import Spinner from './ui/Spinner';
import toast from 'react-hot-toast';

const ClaimModal = ({ isOpen, onClose, item }) => {
  const qc = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const mutation = useMutation({
    mutationFn: submitClaim,
    onSuccess: () => {
      toast.success('Claim submitted successfully! The owner will review it.');
      qc.invalidateQueries(['my-claims']);
      reset();
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit claim.');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({ itemId: item._id, ...data });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Claim: ${item?.title}`} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 bg-primary-500/10 rounded-xl border border-primary-500/20">
          <p className="text-xs text-primary-300 leading-relaxed">
            📋 Describe why this item belongs to you. Be as specific as possible — the owner will review your claim.
          </p>
        </div>

        <div>
          <label className="label" htmlFor="claim-message">Your Message to Owner <span className="text-error">*</span></label>
          <textarea
            id="claim-message"
            rows={3}
            className={`input resize-none ${errors.message ? 'input-error' : ''}`}
            placeholder="Explain why this item is yours and how you'd like to arrange pickup..."
            {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'At least 10 characters' } })}
          />
          {errors.message && <p className="text-xs text-error mt-1">{errors.message.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="claim-proof">Proof of Ownership <span className="text-error">*</span></label>
          <textarea
            id="claim-proof"
            rows={3}
            className={`input resize-none ${errors.proofDescription ? 'input-error' : ''}`}
            placeholder="Describe unique identifiers: serial number, sticker, password, scratch marks, what was inside the bag, etc."
            {...register('proofDescription', { required: 'Proof description is required', minLength: { value: 10, message: 'At least 10 characters' } })}
          />
          {errors.proofDescription && <p className="text-xs text-error mt-1">{errors.proofDescription.message}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-outline flex-1" disabled={mutation.isPending}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={mutation.isPending}
            id="submit-claim-btn"
          >
            {mutation.isPending ? <Spinner size="sm" /> : '📋 Submit Claim'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ClaimModal;
