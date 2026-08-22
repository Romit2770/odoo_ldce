import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reset password
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter your email to receive recovery instructions
        </p>
      </div>

      {submitted ? (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-5 text-center text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
          <h4 className="font-semibold text-sm">Reset link dispatched</h4>
          <p className="mt-1 text-xs text-emerald-700/80">
            If an account exists for {email}, you will receive an email shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
            Send Reset Instructions
          </Button>
        </form>
      )}

      <div className="text-center text-xs">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-emerald-600 dark:text-slate-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Login
        </Link>
      </div>
    </div>
  );
};
