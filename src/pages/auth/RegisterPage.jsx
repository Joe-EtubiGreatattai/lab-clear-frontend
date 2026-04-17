import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { FlaskConical, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['patient', 'lab_staff', 'doctor']),
  dateOfBirth: z.string().optional(),
});

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'patient' },
  });

  const watchedRole = watch('role', 'patient');

  const onSubmit = async (data) => {
    try {
      const user = await registerUser(data);
      toast.success('Account created! Welcome to LabCare.');
      navigate(user.role === 'patient' ? '/patient/dashboard' : '/staff/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-50">
      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-center items-center p-12 relative overflow-hidden bg-primary-50 border-r border-surface-100">
        <div className="absolute inset-0 bg-grid opacity-[0.15]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary-200/20 blur-3xl pointer-events-none" />

        {/* Top-right geometric accent */}
        <div className="absolute top-0 right-0 w-48 h-48 opacity-30">
          <svg viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="192" cy="0" r="96"  stroke="rgba(0,176,133,0.1)" strokeWidth="1" />
            <circle cx="192" cy="0" r="60"  stroke="rgba(0,176,133,0.1)" strokeWidth="0.5" />
            <circle cx="192" cy="0" r="30"  stroke="rgba(0,176,133,0.1)" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="relative z-10 text-center max-w-sm">
          <div className="w-16 h-16 bg-white border border-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <FlaskConical className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="font-heading font-bold text-3xl text-surface-900 mb-4">
            Join <span className="text-primary-600">LabCare</span>
          </h2>
          <p className="text-surface-600 leading-relaxed font-medium">
            Get instant access to your lab results with AI-powered explanations in plain English.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-5 py-8 sm:py-12">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-primary-400/10 border border-primary-400/20 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-primary-600" />
            </div>
            <span className="font-heading font-bold text-xl text-surface-900">Lab<span className="text-primary-600">Clear</span></span>
          </div>

          <h1 className="font-heading font-bold text-2xl text-surface-900 mb-1">Create your account</h1>
          <p className="text-sm text-surface-500 font-medium mb-8">Free to join — takes less than a minute</p>

          <div className="card">
            {/* Role toggle */}
            <div className="flex rounded-xl bg-surface-50 border border-surface-100 p-1 mb-6">
              {[
                { value: 'patient',   label: 'Patient'   },
                { value: 'doctor',    label: 'Doctor'    },
                { value: 'lab_staff', label: 'Lab Staff' },
              ].map(({ value, label }) => (
                <label key={value} className="flex-1 cursor-pointer">
                  <input type="radio" {...register('role')} value={value} className="sr-only" />
                  <div className={`text-center py-2 rounded-lg text-sm font-bold tracking-tight transition-all duration-200 ${
                    watchedRole === value
                      ? 'bg-white text-primary-600 shadow-sm border border-surface-100'
                      : 'text-surface-400 hover:text-surface-600'
                  }`}>
                    {label}
                  </div>
                </label>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="input-label">Full Name</label>
                <input {...register('name')} placeholder="Jane Smith" className="input-field" />
                {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>}
              </div>

              <div>
                <label className="input-label">Email address</label>
                <input type="email" {...register('email')} placeholder="you@example.com" className="input-field" />
                {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
              </div>

              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="At least 6 characters"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-300 hover:text-surface-100 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
              </div>

              {watchedRole === 'patient' && (
                <div className="animate-fadeIn">
                  <label className="input-label">
                    Date of Birth <span className="text-surface-400 font-normal">(optional)</span>
                  </label>
                  <input type="date" {...register('dateOfBirth')} className="input-field" />
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base mt-2">
                {isSubmitting ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-surface-500 mt-6 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
