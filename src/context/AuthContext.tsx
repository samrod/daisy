import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { isEmpty } from 'lodash';

import { useGuideState, getGuideData } from '../state';
import { User, auth, bindAllSettingsToValues, useAuthHandlers } from '../lib';

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const presetsBoundToStore = useRef(false);
  const settingsBoundToStore = useRef(false);
  const { presets, activePreset, setUserMode, setActivePreset, setPresets, setUser, setClientLink } = useGuideState();
  const [currentUser, setCurrentUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  const value = useAuthHandlers(currentUser);

  useEffect(() => {
    if (settingsBoundToStore.current || isEmpty(presets)) {
      return;
    }
    bindAllSettingsToValues();
    settingsBoundToStore.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presets, activePreset]);

  useEffect(() => {
    if (!currentUser?.uid || presetsBoundToStore.current) {
      return;
    }

    getGuideData("clientLink", setClientLink);
    getGuideData("activePreset", setActivePreset);
    getGuideData("userMode", (value: boolean) => setUserMode(value, false));
    getGuideData(`presets`, setPresets);

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
