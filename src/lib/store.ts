import { ref, set, push } from "firebase/database";

import { db } from "./firebase";
import { User } from "firebase/auth";
import { defaults } from "lodash";

interface CreateSettings {
  user: User;
  settings?: typeof defaults;
  name?: string;
}

export const createUser = (user: User) => {
  createUpdateEmail(user);
  captureLogin({ user });
  createSettings({ user });
};

export const createSettings = ({ user, settings = defaults, name = "Standard Settings" }: CreateSettings) => {
  const { uid } = user;
  const settingId = crypto.randomUUID();
  const usersRef = ref(db, `users/${uid}/settings`);
  const settingsRef = ref(db, `settings/${settingId}`);
  set(usersRef, {
    presets: {
      [name]: settingId,
    }
  });
  set(settingsRef, settings);
};

export const createUpdateEmail = (user: User, newEmail?: string) => {
  const { uid } = user;
  const email = user.email || newEmail;
  const usersRef = ref(db, `users/${uid}/email`);
  set(usersRef, email);
};

export const captureLogin = ({ user }) => {
  const { uid, metadata: { lastSignInTime } } = user;
  const loginListRef = ref(db, `users/${uid}/logins`);
  const newLoginRef = push(loginListRef)
  set(newLoginRef, lastSignInTime);
};
