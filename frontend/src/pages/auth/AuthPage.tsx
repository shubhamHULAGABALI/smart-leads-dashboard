/// <reference types="vite/client" />

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLogin, useRegister } from '@/hooks/useAuth';

import type { LoginForm, RegisterForm } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Login Form
// ─────────────────────────────────────────────────────────────────────────────

function LoginFormComponent({ onSwitch }: { onSwitch: () => void }) {
  const [showPw, setShowPw] = useState(false);

  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  return (
    <form
      onSubmit={handleSubmit((d) => loginMutation.mutate(d))}
      className="space-y-5"
    >
      <Input
        label="Email"
        type="email"
        placeholder="you@company.com"
        error={errors.email?.message}
        className="border-white/10 bg-white/[0.03] focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: 'Invalid email',
          },
        })}
      />

      <Input
        label="Password"
        type={showPw ? 'text' : 'password'}
        placeholder="••••••••"
        error={errors.password?.message}
        className="border-white/10 bg-white/[0.03] focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
        rightElement={
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="text-slate-500 transition-colors hover:text-slate-300"
          >
            {showPw ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        }
        {...register('password', {
          required: 'Password is required',
        })}
      />

      <Button
        type="submit"
        loading={loginMutation.isPending}
        className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 shadow-lg shadow-violet-900/30 transition-all duration-200 hover:scale-[1.01]"
        size="lg"
      >
        Sign in
      </Button>

      <p className="text-center text-sm text-slate-500">
        No account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium text-violet-400 transition-colors hover:text-violet-300"
        >
          Create one
        </button>
      </p>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Register Form
// ─────────────────────────────────────────────────────────────────────────────

function RegisterFormComponent({
  onSwitch,
}: {
  onSwitch: () => void;
}) {
  const [showPw, setShowPw] = useState(false);

  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      role: 'sales',
    },
  });

  return (
    <form
      onSubmit={handleSubmit((d) => registerMutation.mutate(d))}
      className="space-y-5"
    >
      <Input
        label="Full Name"
        placeholder="Your name"
        error={errors.name?.message}
        className="border-white/10 bg-white/[0.03] focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
        {...register('name', {
          required: 'Name is required',
          minLength: {
            value: 2,
            message: 'Min 2 chars',
          },
        })}
      />

      <Input
        label="Email"
        type="email"
        placeholder="you@company.com"
        error={errors.email?.message}
        className="border-white/10 bg-white/[0.03] focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: 'Invalid email',
          },
        })}
      />

      <Input
        label="Password"
        type={showPw ? 'text' : 'password'}
        placeholder="Min. 6 characters"
        error={errors.password?.message}
        className="border-white/10 bg-white/[0.03] focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
        rightElement={
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="text-slate-500 transition-colors hover:text-slate-300"
          >
            {showPw ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        }
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Min 6 characters',
          },
        })}
      />

      {/* Role selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-400">
          Role
        </label>

        <div className="grid grid-cols-2 gap-3">
          {(['sales', 'admin'] as const).map((role) => (
            <label
              key={role}
              className="relative cursor-pointer"
            >
              <input
                type="radio"
                value={role}
                className="peer sr-only"
                {...register('role')}
              />

              <div className="flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-slate-400 transition-all peer-checked:border-violet-500 peer-checked:bg-violet-600/10 peer-checked:text-violet-300">
                {role === 'sales' ? 'Sales User' : 'Admin'}
              </div>
            </label>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        loading={registerMutation.isPending}
        className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 shadow-lg shadow-violet-900/30 transition-all duration-200 hover:scale-[1.01]"
        size="lg"
      >
        Create account
      </Button>

      <p className="text-center text-sm text-slate-500">
        Have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium text-violet-400 transition-colors hover:text-violet-300"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Left Hero Panel
// ─────────────────────────────────────────────────────────────────────────────

function PreviewPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative z-10 max-w-xl"
    >
      {/* Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300 backdrop-blur-sm">
        <div className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
        Smart sales workspace
      </div>

      {/* Heading */}
      <h2 className="mt-8 text-6xl font-black leading-[1.05] tracking-tight text-white">
        Your pipeline,
        <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-300 to-blue-400 bg-clip-text text-transparent">
          always in focus.
        </span>
      </h2>

      {/* Subtitle */}
      <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-400">
        Track, qualify, and manage leads with a clean modern workspace
        built for high-performing sales teams.
      </p>

      {/* Divider */}
      <div className="mt-10 h-px w-28 bg-gradient-to-r from-violet-500/70 to-transparent" />

      {/* Feature cards */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          {
            title: 'Lead Tracking',
            desc: 'Monitor every opportunity from discovery to conversion.',
          },
          {
            title: 'Pipeline Visibility',
            desc: 'Keep your sales process organized and transparent.',
          },
          {
            title: 'Team Collaboration',
            desc: 'Work together across teams with shared lead workflows.',
          },
          {
            title: 'Smart Insights',
            desc: 'Understand performance with actionable analytics.',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/20 hover:bg-white/[0.05]"
          >
            <h3 className="text-sm font-semibold text-white">
              {item.title}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>(
    'login'
  );

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#050816]">

      {/* Left panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 p-12 lg:flex lg:w-[56%]">

        {/* Grid */}
        <div className="absolute inset-0 bg-dot-grid opacity-20 [mask-image:radial-gradient(circle_at_center,white,transparent_75%)]" />

        {/* Glow layers */}
        <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/5 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-900/30">
            <Zap className="h-5 w-5 text-white" />
          </div>

          <span className="text-lg font-semibold tracking-tight text-white">
            Smart Leads
          </span>
        </div>

        {/* Hero */}
        <PreviewPanel />

        {/* Footer */}
        <p className="relative z-10 text-sm text-slate-600">
          Built for modern sales teams.
        </p>
      </div>

      {/* Right panel */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#050816] p-6">

        {/* Right-side glow */}
        <div className="absolute inset-0">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        </div>

        {/* Form card */}
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-10 shadow-2xl shadow-violet-950/30 backdrop-blur-2xl">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Zap className="h-4 w-4 text-white" />
            </div>

            <span className="text-base font-semibold text-white">
              Smart Leads
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  {mode === 'login'
                    ? 'Welcome back'
                    : 'Create account'}
                </h1>

                <p className="mt-3 text-base leading-relaxed text-slate-400">
                  {mode === 'login'
                    ? 'Sign in to your Smart Leads workspace.'
                    : 'Join your team and start managing leads.'}
                </p>
              </div>

              {/* Forms */}
              {mode === 'login' ? (
                <LoginFormComponent
                  onSwitch={() => setMode('register')}
                />
              ) : (
                <RegisterFormComponent
                  onSwitch={() => setMode('login')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}