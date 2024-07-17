import { getData, updateData, pushData, useClientState, DB_CLIENTS, serverStamp } from ".";

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
  const { preset, username, guide } = useClientState.getState();

  await updateClientData(``, {
    preset, username, guide,
    createdAt: serverStamp(),
  });
};

export const pushClientData = async (key: string, value: string | number | {}) => {
  const { uid } = useClientState.getState();
  await pushData(`${DB_CLIENTS}/${uid}/${key}`, value);
};
