import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Singleton axios instance — created once, never recreated
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * useApi — returns stable (memoized) API methods that include the current
 * auth token on every request. Safe to use in useEffect dependency arrays.
 */
export function useApi() {
  const { token } = useAuth();

  // Keep a mutable ref to the latest token so the interceptor always sees it
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const get = useCallback(
    (url: string, config?: AxiosRequestConfig) =>
      axiosInstance.get(url, {
        ...config,
        headers: { Authorization: tokenRef.current ? `Bearer ${tokenRef.current}` : '', ...config?.headers },
      }),
    [] // stable — never changes
  );

  const post = useCallback(
    (url: string, data?: any, config?: AxiosRequestConfig) =>
      axiosInstance.post(url, data, {
        ...config,
        headers: { Authorization: tokenRef.current ? `Bearer ${tokenRef.current}` : '', ...config?.headers },
      }),
    []
  );

  const put = useCallback(
    (url: string, data?: any, config?: AxiosRequestConfig) =>
      axiosInstance.put(url, data, {
        ...config,
        headers: { Authorization: tokenRef.current ? `Bearer ${tokenRef.current}` : '', ...config?.headers },
      }),
    []
  );

  const del = useCallback(
    (url: string, config?: AxiosRequestConfig) =>
      axiosInstance.delete(url, {
        ...config,
        headers: { Authorization: tokenRef.current ? `Bearer ${tokenRef.current}` : '', ...config?.headers },
      }),
    []
  );

  return { get, post, put, delete: del };
}

// ── API endpoint map ─────────────────────────────────────────────
export const apiEndpoints = {
  auth: {
    login:    '/auth/login',
    signup:   '/auth/signup',
    me:       '/auth/me',
    github:   '/auth/github',
  },
  apps: {
    list:        '/apps',
    create:      '/apps',
    get:         (id: string) => `/apps/${id}`,
    update:      (id: string) => `/apps/${id}`,
    delete:      (id: string) => `/apps/${id}`,
    deploy:      (id: string) => `/apps/${id}/deploy`,
    deployments: (id: string) => `/apps/${id}/deployments`,
    logs:        (id: string) => `/apps/${id}/logs`,
    restart:     (id: string) => `/apps/${id}/restart`,
    stop:        (id: string) => `/apps/${id}/stop`,
    metrics:     (id: string) => `/apps/${id}/metrics`,
  },
  github: {
    repos:   '/github/repos',
    webhook: (appId: string) => `/github/webhook/${appId}`,
  },
};