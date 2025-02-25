import { createPreset, uniqueClientLink, updateClientLink, useGuideState, useLinkState } from "state";
import {
  DataType, User, getData, pushData, readPropValue, updateData,
  DB_GUIDES, DB_SESSIONS, deletePropValue, DEFAULT_PRESET_NAME,
} from "lib";
// moving the next line above the previous throws an error
export { getAuth, updateEmail, updatePassword } from "firebase/auth";

export const getGuideData = async (key: string, callback) => {
  const { user: { uid } } = useGuideState.getState();
  if (!uid) {
    return;
  }
  const path = `/${DB_GUIDES}/${uid}`;
  return getData({ path, key, callback });
};

export const readGuideProp = async (key: string) => {
  const { user: { uid } } = useGuideState.getState();
  if (!uid) {
    return;
  }
  return await readPropValue(`${DB_GUIDES}/${uid}/`, key);
};

export const guidePropExists = async (key: string) => {
  const response = await readGuideProp(key);
  return typeof response !== "undefined" ? response : false;
};

export const updateGuideData = async (key: string, value: DataType) => {
  const { user } = useGuideState.getState();
  if (!user?.uid) {
    return;
  }
  await updateData(`${DB_GUIDES}/${user.uid}/${key}`, value);
};

export const createGuide = async (user: User) => {
  const initialClientLink = await uniqueClientLink(user.email.split("@")[0]);
  const { setUser } = useGuideState.getState();
  setUser(user);
  await createUpdateEmail(user);
  await captureLogin({ user });
  await updateGuideData(DB_SESSIONS, []);
  await updateClientLink(initialClientLink);
  await createPreset({ name: DEFAULT_PRESET_NAME });
};

export const createUpdateEmail = async (user: User, newEmail?: string) => {
  await updateGuideData("email", user.email || newEmail);
};

export const captureLogin = async ({ user }) => {
  const { metadata: { lastSignInTime }} = user;
  await pushGuideData("logins", lastSignInTime);
};

export const pushGuideData = async (key: string, value: string | number | {}, index?: number) => {
  const { user } = useGuideState.getState();
  if (!user) {
    console.warn("*** pushGuideData: user missing.");
    return;
  }
  const { uid } = user;
  await pushData(`${DB_GUIDES}/${uid}/${key}`, value, index);
};

export const deleteGuideData = async (key) => {
  const { user } = useGuideState.getState();
  if (!user?.uid ) {
    return;
  }
  await deletePropValue(`${DB_GUIDES}/${user.uid}`, key);
};

export const subscribeGuideData = () => {
  const { setActivePreset, setUserMode, setPresets } = useGuideState.getState();
  const { setClientLink } = useLinkState.getState();

  getGuideData("clientLink", setClientLink);
  getGuideData("activePreset", setActivePreset);
  getGuideData("userMode", setUserMode);
  getGuideData(`presets`, setPresets);
};
