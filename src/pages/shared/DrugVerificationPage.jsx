import React from 'react';
import PageWrapper from '../../components/common/PageWrapper';
import {
  ShieldCheck,
  FlaskConical,
  Clock,
  AlertCircle,
  Search,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

const DrugVerificationPage = () => {
  return (
    <PageWrapper
      title="Drug Verification"
      subtitle="Ensuring the safety and authenticity of your medication with NAFDAC-linked verification."
    >
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">

        {/* Main Coming Soon Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-surface-800 border border-surface-600 p-8 sm:p-12">
          {/* Grid */}
          <div className="absolute inset-0 bg-grid opacity-80 rounded-3xl" />
          {/* Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-400/6 blur-3xl rounded-full pointer-events-none" />
          {/* Accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-400 via-primary-500/60 to-transparent rounded-l-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-400/10 border border-primary-400/20 text-xs font-bold uppercase tracking-widest text-primary-400">
                <Clock className="w-3.5 h-3.5" />
                Coming Soon
              </div>

              <h2 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-surface-50">
                Your Health,{' '}
                <span className="text-primary-400 text-glow">Verified.</span>
              </h2>

              <p className="text-lg text-surface-200 leading-relaxed max-w-lg">
                We're finalizing our real-time integration with NAFDAC's Greenbook database to bring you instantaneous drug authenticity checks.
              </p>
            </div>

            <div className="flex-shrink-0 w-full max-w-sm">
              <div className="relative p-6 rounded-2xl bg-surface-700/60 border border-surface-600 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-6 h-6 text-primary-400" />
                  <span className="font-heading font-bold text-lg text-surface-50">Authenticity Check</span>
                </div>

                <div className="h-12 w-full bg-surface-900/60 rounded-xl border border-surface-600 flex items-center px-4 gap-3">
                  <Search className="w-4 h-4 text-surface-300" />
                  <div className="h-2 w-32 bg-surface-600 rounded-full" />
                  <div className="ml-auto w-16 h-8 bg-surface-600/60 rounded-lg" />
                </div>

                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-center gap-3 py-3 border-t border-surface-600/70">
                      <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center border border-surface-600">
                        <FlaskConical className="w-4 h-4 text-surface-300" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 w-24 bg-surface-600 rounded-full" />
                        <div className="h-2 w-16 bg-surface-700 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-surface-900/80 to-transparent flex items-center justify-center pointer-events-none rounded-2xl overflow-hidden">
                  <div className="bg-surface-700 border border-surface-600 px-4 py-2 rounded-full shadow-modal flex items-center gap-2 transform rotate-2">
                    <Lock className="w-3.5 h-3.5 text-primary-400" />
                    <span className="text-xs font-bold text-surface-50">Protected Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: 'NRN Verification',
              desc: 'Instant matching with the NAFDAC database using Registration Numbers.',
            },
            {
              icon: Search,
              title: 'Counterfeit Detection',
              desc: 'Advanced flagging for known fake batches and expired medications.',
            },
            {
              icon: AlertCircle,
              title: 'Safety Alerts',
              desc: 'Immediate notifications for drug recalls and safety advisories.',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="card hover:border-primary-400/20 hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-400/10 border border-primary-400/20 flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="font-heading text-lg font-bold text-surface-50 mb-2">{feature.title}</h3>
              <p className="text-surface-200 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="rounded-3xl border border-dashed border-surface-500 p-8 text-center bg-surface-800/40">
          <div className="max-w-xl mx-auto space-y-4">
            <h4 className="font-heading text-lg font-bold text-surface-50">Are you a Healthcare Provider?</h4>
            <p className="text-surface-200 text-sm leading-relaxed">
              We are currently onboarding selected hospitals and clinics for our early access program. If you would like to test the Drug Verification portal, please contact us.
            </p>
            <button className="text-primary-400 hover:text-primary-300 font-bold text-sm flex items-center gap-2 mx-auto mt-2 transition-colors">
              Apply for Early Access <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
};

export default DrugVerificationPage;
