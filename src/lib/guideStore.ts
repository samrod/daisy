import { DataType, User, getData, pushData, readPropValue, updateData } from "./firebase";
import { DEFAULT_PRESET_NAME, defaults, useGuideState, uuid, DB_GUIDES, DB_PRESETS, updateClientLink } from ".";
// moving the next line above the previous throws an error
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
  const path = `/${DB_GUIDES}/${uid}`;
  return getData({ path, key, callback });
};

export const userPropExists = async (key: string) => {
  const { user: { uid } } = useGuideState.getState();
  const response = await readPropValue(`${DB_GUIDES}/${uid}/`, key);
  return typeof response !== "undefined" ? response : false;
};

export const updateUser = async (key: string, value: DataType) => {
  const { user } = useGuideState.getState();
  await updateData(`${DB_GUIDES}/${user.uid}/${key}`, value);
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
  const presetId = uuid();

  await updateUser("activePreset", presetId);
  await updateUser(`${DB_PRESETS}/${presetId}`, name);
  await updateData(`${DB_PRESETS}/${presetId}`, settings);
};

export const createUpdateEmail = async (user: User, newEmail?: string) => {
  await updateUser("email", user.email || newEmail);
};

export const captureLogin = async ({ user }) => {
  const { metadata: { lastSignInTime }} = user;
  await pushGuideData("logins", lastSignInTime);
};

export const updateSetting = async (setting: string, value: DataType) => {
  const { activePreset } = useGuideState.getState();
  if (!activePreset) {
    await updateData(`${DB_PRESETS}/${setting}`, value);
    return;
  }
  await updateData(`${DB_PRESETS}/${activePreset}/${setting}`, value);
};

export const togglePlay = () => {
  const { settings: { playing } } = useGuideState.getState();
  updateSetting("playing", !playing);
};

export const pushGuideData = async (key: string, value: string | number | {}) => {
  const { user: { uid } } = useGuideState.getState();
  await pushData(`${DB_GUIDES}/${uid}/${key}`, value);
};
