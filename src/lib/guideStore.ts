import { DataType, deletePropValue, getData, pushData, readPropValue, updateData } from "./firebase";
import { DEFAULT_PRESET_NAME, defaults } from "./constants";
import { useGuideState } from "./guideState";
import { useClientState } from "./clientState";

export { getAuth, updateEmail, updatePassword } from "firebase/auth";

interface CreatePreset {
  settings?: typeof defaults;
  name?: string;
}

export const getUserData = (key: string, callback) => {
  const { user: { uid } } = useGuideState.getState();
  if (!uid) {
    return;
  }
  const path = `/users/${uid}`;
  return getData({ path, key, callback });
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

export const userPropExists = async (key: string) => {
  const { user: { uid } } = useGuideState.getState();
  const response = await readPropValue(`users/${uid}/`, key);
  return typeof response !== "undefined" ? response : false;
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
  await pushData(`users/${uid}/logins`, lastSignInTime);
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

