import React, { createContext, useContext, useState, useEffect } from 'react';
import { AVAILABLE_ROLES } from '../constants/roles';
import { fetchUser, loginUserApi, registerUserApi, updateUserApi } from '../lib/api';

const AuthContext = createContext(null);

const DEMO_USERS = {
  'brand@cocacola.com': {
    id: 'usr-brand-001',
    name: 'Sarah Jenkins',
    email: 'brand@cocacola.com',
    company: 'Coca-Cola Company',
    role: 'Brand',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
    title: 'Senior Global Brand Manager',
  },
  'admin@fanforge.io': {
    id: 'usr-demo-001',
    name: 'Alex Morgan',
    email: 'admin@fanforge.io',
    company: 'Apex Sports Global',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    title: 'Head of Event Operations',
  },
  'alex.morgan@fanforge.io': {
    id: 'usr-demo-001',
    name: 'Alex Morgan',
    email: 'alex.morgan@fanforge.io',
    company: 'Apex Sports Global',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    title: 'Head of Event Operations',
  },
  'developer@fanforge.io': {
    id: 'usr-dev-001',
    name: 'Dave Miller',
    email: 'developer@fanforge.io',
    company: 'FanForge SDK Lab',
    role: 'Developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    title: 'Lead Engagement SDK Architect',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUserId = localStorage.getItem('fanforge_user_id');
    if (!savedUserId) {
      setIsLoading(false);
      return;
    }

    fetchUser(savedUserId)
      .then((fetchedUser) => {
        setUser(fetchedUser);
        setCurrentRole(fetchedUser.role);
        setIsAuthenticated(true);
      })
      .catch(() => {
        const demoUser = Object.values(DEMO_USERS).find((u) => u.id === savedUserId);
        if (demoUser) {
          setUser(demoUser);
          setCurrentRole(demoUser.role);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('fanforge_user_id');
          setIsAuthenticated(false);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email, password) => {
    let loggedUser;
    try {
      loggedUser = await loginUserApi({ email, password });
    } catch (err) {
      const demoUser = DEMO_USERS[email.toLowerCase().trim()];
      if (demoUser) {
        loggedUser = demoUser;
      } else {
        throw err;
      }
    }
    localStorage.setItem('fanforge_user_id', loggedUser.id);
    setUser(loggedUser);
    setCurrentRole(loggedUser.role);
    setIsAuthenticated(true);
    return { success: true, user: loggedUser };
  };

  const register = async (formData) => {
    const newUser = await registerUserApi({
      fullName: formData.fullName || 'New User',
      companyName: formData.companyName || '',
      email: formData.email,
      password: formData.password,
      role: formData.role || 'Brand',
    });
    localStorage.setItem('fanforge_user_id', newUser.id);
    setUser(newUser);
    setCurrentRole(newUser.role);
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('fanforge_user_id');
    setIsAuthenticated(false);
    setUser(null);
    setCurrentRole(null);
  };

  const switchRole = (roleId) => {
    // Local-only "preview as another role" affordance — deliberately not persisted,
    // since it isn't a real account role change.
    setCurrentRole(roleId);
  };

  const updateProfile = async (updatedFields) => {
    if (!user) return null;
    const updated = await updateUserApi(user.id, updatedFields);
    setUser(updated);
    return updated;
  };

  const hasPermission = (permissionKey) => {
    const roleObj = AVAILABLE_ROLES.find((r) => r.id === currentRole);
    if (!roleObj) return false;
    if (roleObj.permissions.includes('all')) return true;
    return roleObj.permissions.includes(permissionKey);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        currentRole,
        availableRoles: AVAILABLE_ROLES,
        login,
        register,
        logout,
        switchRole,
        updateProfile,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
