import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type UserRole = 'ADMIN' | 'PHARMACIST' | 'CASHIER' | 'AUDITOR' | 'SUPER_ADMIN';

interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  organizationName: string;
  subscription_status?: string;
  subscription_features?: string[];
  subscription_expiry_date?: string;
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
  /** Check if the tenant's exact plan allows access to a module */
  hasFeature: (featureName: string) => boolean;
  logout: () => void;
  selectedOrganization: { id: string; name: string } | null;
  setSelectedOrganization: (org: { id: string; name: string } | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  hasRole: () => false,
  canCreate: () => false,
  canDelete: () => false,
  canUpdate: () => false,
  hasFeature: () => false,
  logout: () => { },
  selectedOrganization: null,
  setSelectedOrganization: () => { },
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
    create: ['ADMIN', 'PHARMACIST'],
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
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });

  const [selectedOrganization, setSelectedOrganizationState] = useState<{ id: string; name: string } | null>(() => {
    const storedOrg = localStorage.getItem('selectedOrganization');
    if (storedOrg) {
      try { return JSON.parse(storedOrg); } catch { return null; }
    }
    return null;
  });

  useEffect(() => {
    // Intentionally empty or used for other effects. User state is loaded eagerly.
  }, []);

  const setSelectedOrganization = (org: { id: string; name: string } | null) => {
    setSelectedOrganizationState(org);
    if (org) {
      localStorage.setItem('selectedOrganization', JSON.stringify(org));
    } else {
      localStorage.removeItem('selectedOrganization');
    }
    // Dispatch storage event to notify other tabs/components
    window.dispatchEvent(new Event('storage'));
  };

  // Listen for storage changes (e.g., login from another component)
  useEffect(() => {
    const onStorage = () => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch { setUser(null); }
      } else {
        setUser(null);
      }

      const storedOrg = localStorage.getItem('selectedOrganization');
      if (storedOrg) {
        try { setSelectedOrganizationState(JSON.parse(storedOrg)); } catch { setSelectedOrganizationState(null); }
      } else {
        setSelectedOrganizationState(null);
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
    // Super Admins have all permissions for support
    if (role === 'SUPER_ADMIN') return true;
    return permissions[entity]?.create?.includes(role) ?? false;
  };

  const canDelete = (entity: string) => {
    if (!role) return false;
    if (role === 'SUPER_ADMIN') return true;
    return permissions[entity]?.delete?.includes(role) ?? false;
  };

  const canUpdate = (entity: string) => {
    if (!role) return false;
    if (role === 'SUPER_ADMIN') return true;
    return permissions[entity]?.update?.includes(role) ?? false;
  };

  const hasFeature = (featureName: string) => {
    // SUPER_ADMIN always has full access
    if (role === 'SUPER_ADMIN') return true;
    
    // Check if the exact features array includes this feature
    if (user?.subscription_features) {
      return user.subscription_features.includes(featureName);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedOrganization');
    setUser(null);
    setSelectedOrganizationState(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      hasRole, 
      canCreate, 
      canDelete, 
      canUpdate, 
      hasFeature,
      logout,
      selectedOrganization,
      setSelectedOrganization
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
