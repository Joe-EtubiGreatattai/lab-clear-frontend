import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createPatientApi, updatePatientApi } from '../../api/patient.api';
import toast from 'react-hot-toast';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

const PatientForm = ({ patient, onSuccess, onCancel }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: patient
      ? {
          ...patient,
          dateOfBirth: patient.dateOfBirth
            ? new Date(patient.dateOfBirth).toISOString().split('T')[0]
            : '',
        }
      : { gender: 'prefer_not_to_say' },
  });

  const onSubmit = async (data) => {
    try {
      if (patient) {
        await updatePatientApi(patient._id, data);
        toast.success('Patient updated');
      } else {
        await createPatientApi(data);
        toast.success('Patient created');
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="input-label">First Name</label>
          <input {...register('firstName')} className="input-field" />
          {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="input-label">Last Name</label>
          <input {...register('lastName')} className="input-field" />
          {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
        </div>
        <div>
          <label className="input-label">Date of Birth</label>
          <input
            type="date"
            {...register('dateOfBirth')}
            disabled={!!patient}
            className={`input-field ${patient ? 'bg-surface-50 cursor-not-allowed opacity-70' : ''}`}
          />
          {errors.dateOfBirth && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2">{errors.dateOfBirth.message}</p>}
          {patient && <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400 mt-2 italic">Contact clinical support to modify D.O.B</p>}
        </div>
        <div>
          <label className="input-label">Gender</label>
          <select {...register('gender')} className="input-field">
            <option value="prefer_not_to_say">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="input-label">Phone</label>
          <input {...register('phone')} className="input-field" />
        </div>
        <div>
          <label className="input-label">Email</label>
          <input type="email" {...register('email')} className="input-field" />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary flex-1 py-4 text-base tracking-tight"
        >
          {isSubmitting ? 'Synchronizing…' : patient ? 'Update Secure Profile' : 'Complete Registration'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary px-8 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all font-bold"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default PatientForm;
