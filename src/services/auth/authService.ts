import { User } from '@/types/domain';
import { storage } from '@/services/storage/localStorage';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
}

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    const cached = storage.get<User | null>('current_user', {
      id: 'usr_demo_1',
      email: 'alex.traveler@example.com',
      name: 'Alex Johnson',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return cached;
  },

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const user: User = {
      id: 'usr_demo_1',
      email: credentials.email,
      name: 'Alex Johnson',
      role: credentials.email.includes('admin') ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.set('auth_token', 'mock_jwt_token_123');
    storage.set('current_user', user);
    return { user, token: 'mock_jwt_token_123' };
  },

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const user: User = {
      id: `usr_${Date.now()}`,
      email: data.email,
      name: data.name,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.set('auth_token', 'mock_jwt_token_123');
    storage.set('current_user', user);
    return { user, token: 'mock_jwt_token_123' };
  },

  async logout(): Promise<void> {
    storage.remove('auth_token');
    storage.remove('current_user');
  },
};
