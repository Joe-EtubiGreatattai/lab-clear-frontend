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
  role: z.enum(['patient', 'lab_staff']),
  dateOfBirth: z.string().optional(),
});

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState('patient');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'patient' },
  });

  const watchedRole = watch('role', 'patient');

  const onSubmit = async (data) => {
    try {
      const user = await registerUser(data);
      toast.success('Account created! Welcome to LabClear.');
      navigate(user.role === 'patient' ? '/patient/dashboard' : '/staff/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-teal-500 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: `${(i + 1) * 80}px`,
                height: `${(i + 1) * 80}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center max-w-sm">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <FlaskConical className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-heading font-bold text-3xl text-white mb-4">Join LabClear</h2>
          <p className="text-primary-100 leading-relaxed">
            Get instant access to your lab results with AI-powered explanations in plain English.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-5 py-8 sm:py-12 bg-slate-50">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-slate-900">LabClear</span>
          </div>

          <h1 className="font-heading font-bold text-2xl text-slate-900 mb-1">Create your account</h1>
          <p className="text-sm text-slate-500 mb-8">Free to join — takes less than a minute</p>

          <div className="card shadow-hover">
            {/* Role toggle */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
              {[
                { value: 'patient',   label: 'I am a Patient' },
                { value: 'lab_staff', label: 'Lab Staff'       },
              ].map(({ value, label }) => (
                <label key={value} className="flex-1 cursor-pointer">
                  <input type="radio" {...register('role')} value={value} className="sr-only" />
                  <div className={`text-center py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    watchedRole === value
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
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
                {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
              </div>

              <div>
                <label className="input-label">Email address</label>
                <input type="email" {...register('email')} placeholder="you@example.com" className="input-field" />
                {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
              </div>

              {watchedRole === 'patient' && (
                <div className="animate-fadeIn">
                  <label className="input-label">
                    Date of Birth <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input type="date" {...register('dateOfBirth')} className="input-field" />
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base mt-2">
                {isSubmitting ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
