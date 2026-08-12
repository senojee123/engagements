import React, { createContext, useContext, useState, useEffect } from 'react';
import { AVAILABLE_ROLES } from '../constants/roles';
import { fetchUser, loginUserApi, registerUserApi, updateUserApi, deleteUserApi } from '../lib/api';

const AuthContext = createContext(null);

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

    let isFinished = false;
    const safetyTimeout = setTimeout(() => {
      if (!isFinished) {
        setIsLoading(false);
      }
    }, 2000);

    fetchUser(savedUserId)
      .then((fetchedUser) => {
        isFinished = true;
        setUser(fetchedUser);
        setCurrentRole(fetchedUser.role);
        setIsAuthenticated(true);
      })
      .catch(() => {
        isFinished = true;
        localStorage.removeItem('fanforge_user_id');
        setIsAuthenticated(false);
      })
      .finally(() => {
        isFinished = true;
        clearTimeout(safetyTimeout);
        setIsLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const loggedUser = await loginUserApi({ email, password });
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
    return { success: true, user: newUser };
  };

  const logout = () => {
    localStorage.removeItem('fanforge_user_id');
    setIsAuthenticated(false);
    setUser(null);
    setCurrentRole(null);
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      await deleteUserApi(user.id);
    } catch (e) {
      // Offline fallback
    }
    logout();
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
        deleteAccount,
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
