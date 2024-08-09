import { updateLinkData, useClientState } from ".";
import { getData, updateData, pushData, DB_CLIENTS, serverStamp } from "../lib";

export const getClientData = (key: string, callback: (params: unknown) => void) => {
  const { uid } = useClientState.getState();
  getData({ path: `${DB_CLIENTS}/${uid}`, key, callback});
};

export const updateClientData = (key: string, value) => {
  const { uid } = useClientState.getState();
  if (!uid) {
    return;
  }
  updateData(`${DB_CLIENTS}/${uid}/${key}`, value);
};

export const createClient = async () => {
  const { uid, preset, username, guide, setUid, setCreatedAt } = useClientState.getState();
  if (uid) {
    return;
  }
  setUid();
  setCreatedAt();
  updateLinkData("client", useClientState.getState().uid);
  await updateClientData(``, {
    preset, username, guide,
    createdAt: serverStamp(),
  });
};

export const pushClientData = async (key: string, value: string | number | {}) => {
  const { uid } = useClientState.getState();
  if (!uid) {
    return;
  }
  await pushData(`${DB_CLIENTS}/${uid}/${key}`, value);
};
