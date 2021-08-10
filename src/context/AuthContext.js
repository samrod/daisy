import React, { useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setLoading(false);
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    logout: () => auth.signOut(),
    login: (email, password) => auth.signInWithEmailAndPassword(email, password),
    signup: (email, password) => auth.createUserWithEmailAndPassword(email, password),
    updateEmail: (email) => currentUser.updateEmail(email),
    resetPassword: (email) => auth.sendPasswordResetEmail(email),
    updatePassword: (password) => currentUser.updatePassword(password),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
};
