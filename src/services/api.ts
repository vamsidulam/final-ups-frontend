import { UPS, UPSEvent, DashboardStats } from "@/components/dashboard/types";

console.log("ENV:", import.meta.env);
console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
console.log("VITE_WS_URL:", import.meta.env.VITE_WS_URL);

const envBaseUrl = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
if (!envBaseUrl) {
  throw new Error('VITE_API_BASE_URL is not set. Please create a .env.local file with VITE_API_BASE_URL=http://localhost:10000/api');
}
export const API_BASE_URL = envBaseUrl;

// Authentication types
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Generic API call function
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from localStorage for authenticated requests
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    headers,
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Authentication API
export const authAPI = {
  signup: async (userData: UserCreate): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Signup failed');
    }

    return response.json();
  },

  signin: async (credentials: UserLogin): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Signin failed');
    }

    return response.json();
  },

  getCurrentUser: async (): Promise<User> => 
    apiCall<User>('/auth/me'),

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },

  getToken: (): string | null => {
    return localStorage.getItem('access_token');
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: (): Promise<DashboardStats> => 
    apiCall<DashboardStats>('/dashboard/stats'),
};

// UPS API
export const upsAPI = {
  // Get all UPS systems with optional filters
  getAll: (params?: {
    status?: string;
    location?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: UPS[]; total: number; limit: number; offset: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.location) searchParams.append('location', params.location);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    
    const queryString = searchParams.toString();
    const endpoint = `/ups${queryString ? `?${queryString}` : ''}`;
    return apiCall(endpoint);
  },

  // Get single UPS details
  getById: (id: string): Promise<UPS> => 
    apiCall<UPS>(`/ups/${id}`),

  // Get UPS status
  getStatus: (id: string): Promise<{
    upsId: string;
    status: string;
    lastChecked: string;
    batteryLevel: number;
    temperature: number;
    powerInput: number;
    powerOutput: number;
  }> => 
    apiCall(`/ups/${id}/status`),

  // Get UPS events
  getEvents: (id: string, params?: {
    event_type?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: UPSEvent[] }> => {
    const searchParams = new URLSearchParams();
    if (params?.event_type) searchParams.append('event_type', params.event_type);
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    
    const queryString = searchParams.toString();
    const endpoint = `/ups/${id}/events${queryString ? `?${queryString}` : ''}`;
    return apiCall(endpoint);
  },

  // Get bulk status for multiple UPS
  getBulkStatus: (ids: string[]): Promise<{ data: any[] }> => {
    const searchParams = new URLSearchParams();
    searchParams.append('ids', ids.join(','));
    return apiCall(`/ups/status/bulk?${searchParams.toString()}`);
  },
};

// Predictions API
export const predictionsAPI = {
  // Get predictions with optional filtering
  getAll: (params?: {
    ups_id?: string;
    risk_level?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ predictions: any[] }> => {
    const searchParams = new URLSearchParams();
    if (params?.ups_id) searchParams.append('ups_id', params.ups_id);
    if (params?.risk_level) searchParams.append('risk_level', params.risk_level);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    
    const queryString = searchParams.toString();
    const endpoint = `/predictions${queryString ? `?${queryString}` : ''}`;
    return apiCall(endpoint);
  },
};

// Alerts API
export const alertsAPI = {
  // Get all alerts with optional filters
  getAll: (params?: {
    severity?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: any[] }> => {
    const searchParams = new URLSearchParams();
    if (params?.severity) searchParams.append('severity', params.severity);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    
    const queryString = searchParams.toString();
    const endpoint = `/alerts${queryString ? `?${queryString}` : ''}`;
    return apiCall(endpoint);
  },

  // Get alert counts by status
  getCounts: (): Promise<{ counts: any[] }> => 
    apiCall('/alerts/count'),
};

// Reports API
export const reportsAPI = {
  // Get UPS performance report
  getPerformance: (params?: {
    start_date?: string;
    end_date?: string;
    ups_ids?: string[];
  }): Promise<{ data: any[] }> => {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    if (params?.ups_ids) searchParams.append('ups_ids', params.ups_ids.join(','));
    
    const queryString = searchParams.toString();
    const endpoint = `/reports/ups-performance${queryString ? `?${queryString}` : ''}`;
    return apiCall(endpoint);
  },
};

// Locations API
export const locationsAPI = {
  // Get all unique locations
  getAll: (): Promise<{ data: string[] }> => 
    apiCall('/locations'),
};

// Health check API
export const healthAPI = {
  check: (): Promise<{ status: string; db: boolean; error?: string }> => 
    apiCall('/health'),
};
