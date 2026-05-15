'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@qrd/ui';
import { Input } from '@qrd/ui';
import { Card } from '@qrd/ui';
import { login, register } from '../lib/api';
import { saveTokens } from '../lib/session';

interface AuthFormProps {
  type: 'login' | 'register';
}

export function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const label = type === 'login' ? 'Sign in to your account' : 'Create your account';
  const actionLabel = type === 'login' ? 'Sign in' : 'Create account';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response =
        type === 'login'
          ? await login(email, password)
          : await register(email, password, name);

      saveTokens(response.accessToken, response.refreshToken);
      setMessage('Success. You are signed in.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to submit form');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900">{label}</h2>
        <p className="mt-2 text-sm text-slate-600">Secure encrypted storage with private key ownership.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {type === 'register' && (
          <Input
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            required
          />
        )}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter password"
          required
        />
        <div className="flex items-center justify-between gap-3">
          <Button
            label={isLoading ? 'Processing…' : actionLabel}
            className="w-full"
            disabled={isLoading}
          />
        </div>
      </form>
      {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
    </Card>
  );
}
