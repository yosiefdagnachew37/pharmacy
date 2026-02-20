import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type UserRole = 'ADMIN' | 'PHARMACIST' | 'CASHIER' | 'AUDITOR';

interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  /** Check if user has one of the given roles */
  hasRole: (...roles: UserRole[]) => boolean;
  /** Check if user can perform a specific action */
  canCreate: (entity: string) => boolean;
  canDelete: (entity: string) => boolean;
  canUpdate: (entity: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  hasRole: () => false,
  canCreate: () => false,
  canDelete: () => false,
  canUpdate: () => false,
  logout: () => {},
});

// Permission matrix: entity -> action -> allowed roles
const permissions: Record<string, Record<string, UserRole[]>> = {
  medicines: {
    create: ['ADMIN', 'PHARMACIST'],
    update: ['ADMIN', 'PHARMACIST'],
    delete: ['ADMIN'],
  },
  batches: {
    create: ['ADMIN', 'PHARMACIST'],
    update: ['ADMIN', 'PHARMACIST'],
    delete: ['ADMIN'],
  },
  patients: {
    create: ['ADMIN', 'PHARMACIST', 'CASHIER'],
    update: ['ADMIN', 'PHARMACIST'],
    delete: ['ADMIN'],
  },
  prescriptions: {
    create: ['ADMIN', 'PHARMACIST'],
    update: ['ADMIN', 'PHARMACIST'],
    delete: ['ADMIN'],
  },
  sales: {
    create: ['ADMIN', 'PHARMACIST', 'CASHIER'],
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch { /* ignore bad data */ }
    }
  }, []);

  // Listen for storage changes (e.g., login from another component)
  useEffect(() => {
    const onStorage = () => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch { setUser(null); }
      } else {
        setUser(null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const role = user?.role || null;

  const hasRole = (...roles: UserRole[]) => {
    if (!role) return false;
    return roles.includes(role);
  };

  const canCreate = (entity: string) => {
    if (!role) return false;
    return permissions[entity]?.create?.includes(role) ?? false;
  };

  const canDelete = (entity: string) => {
    if (!role) return false;
    return permissions[entity]?.delete?.includes(role) ?? false;
  };

  const canUpdate = (entity: string) => {
    if (!role) return false;
    return permissions[entity]?.update?.includes(role) ?? false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, hasRole, canCreate, canDelete, canUpdate, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
