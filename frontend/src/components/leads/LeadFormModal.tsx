import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { useCreateLead, useUpdateLead } from '@/hooks/useLeads';
import type { Lead, CreateLeadForm } from '@/types';

interface LeadFormModalProps {
  open: boolean;
  onClose: () => void;
  lead?: Lead | null;
}

const defaultValues: CreateLeadForm = {
  name: '',
  email: '',
  status: 'new',
  source: 'website',
};

export function LeadFormModal({ open, onClose, lead }: LeadFormModalProps) {
  const isEditing = !!lead;
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateLeadForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      reset(
        lead
          ? { name: lead.name, email: lead.email, status: lead.status, source: lead.source }
          : defaultValues
      );
    }
  }, [open, lead, reset]);

  const onSubmit = async (data: CreateLeadForm) => {
    if (isEditing && lead) {
      await updateMutation.mutateAsync({ id: lead._id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    onClose();
  };

  const status = watch('status');
  const source = watch('source');

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Lead' : 'New Lead'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update lead information.' : 'Add a new lead to your pipeline.'}
          </DialogDescription>
        </DialogHeader>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <Input
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            error={errors.name?.message}
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'Minimum 2 characters' },
            })}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. rahul@example.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: 'Please enter a valid email',
              },
            })}
          />

          <div className="grid grid-cols-2 gap-3">
            {/* Status */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Status
              </label>
              <Select
                value={status}
                onValueChange={(v) => setValue('status', v as CreateLeadForm['status'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Source
              </label>
              <Select
                value={source}
                onValueChange={(v) => setValue('source', v as CreateLeadForm['source'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              {isEditing ? 'Save Changes' : 'Create Lead'}
            </Button>
          </DialogFooter>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
