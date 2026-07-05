import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type Role = 'admin' | 'client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string, role: Role) => { ok: boolean; error?: string };
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

// Demo credentials
const DEMO_USERS: Array<AuthUser & { password: string }> = [
  { id: 'admin1', name: 'Coach Ryan', email: 'admin@t2t.com', password: 'admin123', role: 'admin' },
  { id: 'client1', name: 'Alex Johnson', email: 'client@t2t.com', password: 'client123', role: 'client' },
];

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (email: string, password: string, role: Role): { ok: boolean; error?: string } => {
    const found = DEMO_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === role
    );
    if (!found) {
      return { ok: false, error: 'Invalid email, password, or role.' };
    }
    const { password: _p, ...authUser } = found;
    setUser(authUser);
    return { ok: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAdmin: user?.role === 'admin',
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
