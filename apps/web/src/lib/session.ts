const ACCESS_KEY = 'qrd_access_token';
const REFRESH_KEY = 'qrd_refresh_token';
const DEVICE_KEY = 'qrd_device_key';

export function saveTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function saveDeviceKey(deviceKey: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEVICE_KEY, deviceKey);
}

export function getDeviceKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DEVICE_KEY);
}

export function clearDeviceKey() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DEVICE_KEY);
}
