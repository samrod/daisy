import { createPreset, uniqueClientLink, updateClientLink, useGuideState } from "state";
import {
  DataType, User, getData, pushData, readPropValue, updateData,
  DB_GUIDES, DB_SESSIONS,
} from "lib";
// moving the next line above the previous throws an error
export { getAuth, updateEmail, updatePassword } from "firebase/auth";

export const getGuideData = (key: string, callback) => {
  const { user: { uid } } = useGuideState.getState();
  if (!uid) {
    return;
  }
  const path = `/${DB_GUIDES}/${uid}`;
  return getData({ path, key, callback });
};

export const guidePropExists = async (key: string) => {
  const { user: { uid } } = useGuideState.getState();
  const response = await readPropValue(`${DB_GUIDES}/${uid}/`, key);
  return typeof response !== "undefined" ? response : false;
};

export const updateGuide = async (key: string, value: DataType) => {
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
  await updateGuide(DB_SESSIONS, []);
  await updateClientLink(initialClientLink);
  await createPreset({});
};

export const createUpdateEmail = async (user: User, newEmail?: string) => {
  await updateGuide("email", user.email || newEmail);
};

export const captureLogin = async ({ user }) => {
  const { metadata: { lastSignInTime }} = user;
  await pushGuideData("logins", lastSignInTime);
};

export const pushGuideData = async (key: string, value: string | number | {}) => {
  const { user } = useGuideState.getState();
  if (!user) {
    console.warn("*** pushGuideData: user missing.");
    return;
  }
  const { uid } = user;
  await pushData(`${DB_GUIDES}/${uid}/${key}`, value);
};
