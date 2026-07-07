// Additional types for auth and dashboards

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  sendOtp: (email: string, code: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (email: string, code: string) => Promise<{ success: boolean; message: string }>;
  registerWithOtp: (data: { email: string; code: string; firstName: string; lastName: string; password: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SendOtpData {
  email: string;
  code: string;
}

export interface CVDocument {
  id: string;
  userId: string;
  title: string;
  lastModified: string;
  status: 'draft' | 'published';
  templateId: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalCVs: number;
  activeUsers: number;
  publishedCVs: number;
  userGrowthData: { month: string; users: number; cvs: number }[];
  recentActivity: ActivityLog[];
}
