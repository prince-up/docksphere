export interface User {
  id: string;
  email: string;
  username: string;
  github_username?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  github_repo: string;
  status: 'running' | 'stopped' | 'building' | 'failed';
  url?: string;
  container_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Deployment {
  id: string;
  project_id: string;
  status: 'pending' | 'building' | 'success' | 'failed';
  commit_sha: string;
  commit_message: string;
  created_at: string;
  logs?: string[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiError {
  detail: string;
}