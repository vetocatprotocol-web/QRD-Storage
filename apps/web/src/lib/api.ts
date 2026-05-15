import type { CreateUploadSessionDto, UploadSessionResponse } from '@qrd/shared-types';
import type { AuthTokens } from '@qrd/shared-types';
import type { DeviceRegistrationDto } from '@qrd/shared-types';

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${apiBase}/${path}`, {
    credentials: 'include',
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || 'Unknown error');
  }
  return payload as T;
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  return request<AuthTokens>('auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string, firstName: string): Promise<AuthTokens> {
  return request<AuthTokens>('auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, firstName }),
  });
}

export async function registerDevice(token: string, payload: DeviceRegistrationDto) {
  return request<{ deviceId: string; deviceKey: string; name: string; createdAt: string }>('devices/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function createUploadSession(token: string, payload: CreateUploadSessionDto): Promise<UploadSessionResponse> {
  return request<UploadSessionResponse>('uploads/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function getFiles(token: string) {
  return request<any[]>('files', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
