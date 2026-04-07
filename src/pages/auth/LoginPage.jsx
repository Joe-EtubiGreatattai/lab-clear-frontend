import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { FlaskConical, Eye, EyeOff, FileText, ShieldCheck, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});

const features = [
  { icon: FileText,    text: 'Instant access to your lab results'      },
  { icon: FileText,    text: 'Clinical diagnostic plain English explanations' },
  { icon: ShieldCheck, text: 'Secure and private — your data is yours' },
];

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'patient' ? '/patient/dashboard' : '/staff/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative overflow-hidden bg-primary-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,176,133,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-grid opacity-10" />

        <Link to="/" className="relative z-10 flex items-center gap-3 group">
          <div className="w-12 h-12 bg-white border border-primary-200 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-glow transition-all duration-500">
            <FlaskConical className="w-6 h-6 text-primary-600" strokeWidth={2.5} />
          </div>
          <span className="font-heading font-bold text-2xl text-surface-900 tracking-tighter">Lab<span className="text-primary-600">Clear</span></span>
        </Link>

        <div className="relative z-10 max-w-xl">
          <div className="mb-8 overflow-hidden">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600 mb-6 animate-slideIn">
              <span className="w-8 h-[1px] bg-primary-300" /> Precision Diagnostics
            </span>
            <h1 className="font-heading font-bold text-6xl text-surface-900 leading-[1.1] tracking-tighter mb-8 animate-fadeIn">
              Your health results,<br />
              <span className="text-primary-600 underline decoration-primary-200 decoration-4 underline-offset-8">finally explained.</span>
            </h1>
          </div>
          
          <p className="text-surface-600 text-lg leading-relaxed mb-12 max-w-md animate-fadeIn stagger-2 font-medium">
            Translating complex laboratory data into clear, actionable insights powered by medical precision.
          </p>

          <div className="grid grid-cols-1 gap-6 animate-fadeIn stagger-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white border border-primary-100 flex items-center justify-center group-hover:border-primary-400 transition-all duration-500 shadow-sm">
                  <Icon className="w-5 h-5 text-primary-500" />
                </div>
                <span className="text-sm text-surface-700 font-semibold tracking-tight">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[10px] font-bold uppercase tracking-widest text-surface-500">
          © {new Date().getFullYear()} LabClear · Est. 2024
        </p>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-20 py-12 bg-surface-50">
        <div className="w-full max-w-md mx-auto animate-fadeIn">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-11 h-11 bg-primary-400/10 border border-primary-400/20 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-primary-400" />
            </div>
            <span className="font-heading font-bold text-2xl text-surface-900 tracking-tighter">LabClear</span>
          </div>

          <div className="mb-10">
            <h2 className="font-heading font-bold text-4xl text-surface-900 tracking-tighter mb-3">Sign In</h2>
            <p className="text-surface-500 font-medium">Access your medical diagnostic portal</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="input-label">Identity</label>
              <input
                type="email"
                {...register('email')}
                placeholder="registered@email.com"
                className="input-field"
              />
              {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-2 ml-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-end mb-2 ml-1">
                <label className="text-xs font-bold uppercase tracking-wider text-surface-500">Access Key</label>
                <Link to="#" className="text-[10px] font-bold uppercase tracking-wider text-primary-600 hover:text-primary-700">Forgot Code?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="input-field pr-12 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-300 hover:text-primary-400 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-2 ml-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 text-sm tracking-widest uppercase mt-4">
              {isSubmitting ? 'Verifying...' : 'Authenticate'}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-surface-200">
            <p className="text-center text-sm text-surface-500 font-medium">
              New to LabClear?{' '}
              <Link to="/register" className="text-primary-600 font-bold hover:underline underline-offset-4 decoration-primary-400/40">
                Register Portal Access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
