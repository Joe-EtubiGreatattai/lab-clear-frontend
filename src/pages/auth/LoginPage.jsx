import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { FlaskConical, Eye, EyeOff, ShieldCheck, Sparkles, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});

const features = [
  { icon: FileText,   text: 'Instant access to your lab results'       },
  { icon: Sparkles,   text: 'AI-powered plain English explanations'     },
  { icon: ShieldCheck, text: 'Secure and private — your data is yours'  },
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
    <div className="min-h-screen flex">
      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-teal-500 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
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

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-white">LabClear</span>
          </div>

          <h2 className="font-heading font-bold text-4xl text-white leading-tight mb-4">
            Your health results,<br />finally explained.
          </h2>
          <p className="text-primary-100 text-base leading-relaxed mb-12 max-w-sm">
            LabClear translates confusing lab numbers into clear, simple language — so you always know what your results mean.
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-primary-100 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-primary-200">
          © {new Date().getFullYear()} LabClear. Secure medical platform.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md animate-fadeIn">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-slate-900">LabClear</span>
          </div>

          <h1 className="font-heading font-bold text-2xl text-slate-900 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 mb-8">Sign in to view your results</p>

          <div className="card shadow-hover">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="input-label">Email address</label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="input-field"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
              </div>

              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    autoComplete="current-password"
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

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base mt-2">
                {isSubmitting ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
