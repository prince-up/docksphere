import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuth } from '@/hooks/useAuth';

class ApiClient {
  private client: AxiosInstance;
  private getToken: () => string | null;

  constructor(getToken: () => string | null) {
    this.getToken = getToken;

    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle common errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          if (typeof window !== 'undefined') {
            localStorage.removeItem('docksphere_token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config);
  }
}

// Hook to use API client with auth context
export function useApi() {
  const { token } = useAuth();

  const api = new ApiClient(() => token);

  return {
    get: api.get.bind(api),
    post: api.post.bind(api),
    put: api.put.bind(api),
    patch: api.patch.bind(api),
    delete: api.delete.bind(api),
  };
}

// Direct API client instance (for use outside React components)
let apiClient: ApiClient | null = null;

export function getApiClient() {
  if (!apiClient) {
    apiClient = new ApiClient(() => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('docksphere_token');
      }
      return null;
    });
  }
  return apiClient;
}

// API endpoints
export const apiEndpoints = {
  auth: {
    login: '/auth/login',
    login_json: '/auth/login-json',
    signup: '/auth/signup',
    me: '/auth/me',
    github: '/auth/github',
  },
  apps: {
    list: '/apps',
    create: '/apps',
    get: (id: string) => `/apps/${id}`,
    update: (id: string) => `/apps/${id}`,
    delete: (id: string) => `/apps/${id}`,
    deploy: (id: string) => `/apps/${id}/deploy`,
    deployments: (id: string) => `/apps/${id}/deployments`,
    logs: (id: string) => `/apps/${id}/logs`,
    restart: (id: string) => `/apps/${id}/restart`,
    stop: (id: string) => `/apps/${id}/stop`,
    metrics: (id: string) => `/apps/${id}/metrics`,
  },
  github: {
    repos: '/github/repos',
    webhook: (appId: string) => `/github/webhook/${appId}`,
  },
};