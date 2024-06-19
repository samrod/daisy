import { ref, set, onValue, push, remove, get, child } from "firebase/database";

import { db } from "./firebase";
import { User } from "firebase/auth";
import { DEFAULT_PRESET_NAME, defaults } from "./constants";
import { useGuideState } from "./guideState";
import { useClientState } from "./clientState";

type Setting = string | number | boolean;
export type DataType = Setting | { [key: string]: Setting | {}};
interface CreatePreset {
  settings?: typeof defaults;
  name?: string;
}

interface GetData {
  key: string;
  callback: (setting: number | boolean | string | object) => void;
  path?: string;
  debug?: boolean;
}

const executeCallback = ({ key, path, callback, debug }: GetData) => (snapshot) => {
  const val = snapshot.val();
  if ((typeof val).match(/undefined|null/i) ) {
    console.warn(`*** ${key} returned "${val}" from ${path}/${key}`);
    return;
  }
  if (debug) {
    console.log(`*** ${key} returned "${val}" from ${path}`);
  }
  callback(val)
};

export const getData = (params: GetData) => {
  const { path, key} = params;
  const keyRef = ref(db, `${path}/${key}`);
  return onValue(keyRef, executeCallback(params));
};

export const getUserData = ({ key, callback, debug }: GetData) => {
  const { user: { uid } } = useGuideState.getState();
  if (!uid) {
    return;
  }
  const path = `/users/${uid}`;
  return getData({ path, key, callback, debug });
};

const updateSettingFromFirebase = (key: string) => (val) => {
  const { setSetting } = useGuideState.getState();
   setSetting(key, val);
};

const bindSettingToValue = (activePreset: string, key: string) => {
  getData({ path: `presets/${activePreset}`, key, callback: updateSettingFromFirebase(key) })
};

export const bindAllSettingsToValues = () => {
  const { activePreset, settings } = useGuideState.getState();
  Object.keys(settings).forEach(bindSettingToValue.bind(null, activePreset));
};

export const deletePropValue = async (path: string, key: string ) => {
  const dataRef = child(ref(db), `${path}/${key}`);
  return await remove(dataRef);
};

export const readPropValue = async (key: string, value: string) => {
  if (!key || value === undefined || value === null) {
    return "Invalid key or value";
  }
  const queryRef = child(ref(db), `${key}/${value}`);
  const snapshot = await get(queryRef);
  if (snapshot.exists()) {
    return snapshot.toJSON();
  }
  return undefined;
};

export const propExists = async (key: string, value: string) => {
  const response = await readPropValue(key, value);
  return typeof response !== "undefined" ? response : false;
};

export const userPropExists = async (key: string) => {
  const { user: { uid } } = useGuideState.getState();
  const response = await readPropValue(`users/${uid}/`, key);
  return typeof response !== "undefined" ? response : false;
};

export const updateData = async (path: string, value:  DataType) => {
  await set(ref(db, path), value);
};

export const updateUser = async (key: string, value: DataType) => {
  const { user } = useGuideState.getState();
  await updateData(`users/${user.uid}/${key}`, value);
};

export const createUser = async (user: User) => {
  const initialClientLink = user.email.split("@")[0];
  const { setUser } = useGuideState.getState();
  setUser(user);
  await createUpdateEmail(user);
  await captureLogin({ user });
  await createPreset({});
  await updateClientLink(initialClientLink);
};

export const createPreset = async ({ settings = defaults, name = DEFAULT_PRESET_NAME }: CreatePreset) => {
  const presetId = crypto.randomUUID();

  await updateUser("activePreset", presetId);
  await updateUser(`presets/${presetId}`, name);
  await updateData(`presets/${presetId}`, settings);
};

export const createUpdateEmail = async (user: User, newEmail?: string) => {
  await updateUser("email", user.email || newEmail);
};

export const captureLogin = async ({ user }) => {
  const { uid, metadata: { lastSignInTime } } = user;
  const loginListRef = ref(db, `users/${uid}/logins`);
  const newLoginRef = push(loginListRef)
  await set(newLoginRef, lastSignInTime);
};
export const updateClientLink = async (clientLink: string) => {
  const { setClientLink, activePreset: preset } = useGuideState.getState();
  const { setPreset } = useClientState.getState();
  const oldClientLink = await userPropExists("clientLink");
  deletePropValue("clientLinks", oldClientLink as string);
  setClientLink(clientLink);
  setPreset(preset);
  updateUser("clientLink", clientLink);
  updateData("clientLinks", {
    [clientLink]: {
      status: 0,
      preset,
    },
  });
};

export const updateSetting = async (setting: string, value: DataType) => {
  const { activePreset } = useGuideState.getState();
  if (!activePreset) {
    await updateData(`presets/${setting}`, value);
    return;
  }
  await updateData(`presets/${activePreset}/${setting}`, value);
};

export const togglePlay = () => {
  const { settings: { playing } } = useGuideState.getState();
  updateSetting("playing", !playing);
};

