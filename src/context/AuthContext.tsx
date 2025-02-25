import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { isEmpty } from 'lodash';
import { User } from 'firebase/auth';

import { useGuideState, subscribeAllSettings, useLinkState, subscribeGuideData } from 'state';
import { FormHandlerProps, FormEventHandlers, useAuthHandlers, auth } from 'lib';

interface AuthContextType {
  currentUser: User | null;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  updateEmail: (email: string) => void;
  resetPassword: (email: string) => void;
  updatePassword: (password: string) => void;
  getFormHandlers: (props: FormHandlerProps) => FormEventHandlers;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const presetsBoundToStore = useRef(false);
  const settingsBoundToStore = useRef(false);
  const { presets, activePreset, setUserMode, setActivePreset, setPresets, setUser } = useGuideState(state => state);
  const { setClientLink } = useLinkState(state => state)
  const [currentUser, setCurrentUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  const value = useAuthHandlers(currentUser);

  useEffect(() => {
    if (settingsBoundToStore.current || isEmpty(presets)) {
      return;
    }
    subscribeAllSettings();
    settingsBoundToStore.current = true;
  }, [presets, activePreset]);

  useEffect(() => {
    if (!currentUser?.uid || presetsBoundToStore.current) {
      return;
    }
    subscribeGuideData();
    presetsBoundToStore.current = true;
  }, [activePreset, currentUser, presets, setActivePreset, setPresets, setUserMode, setClientLink]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setLoading(false);
      setCurrentUser(user);
      setUser(user);
    });

    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
};
