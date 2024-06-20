import { isEmpty } from "lodash";

import { getData, updateData } from "./firebase";
import { useGuideState } from "./guideState";
import { useClientState } from "./clientState";

const getState = (key: string) => {
  const guideState = useGuideState.getState();
  const clientState = useClientState.getState();
  const value = guideState[key] || clientState[key];

  if (isEmpty(value)) {
    console.warn(`*** getState: ${key} has no value.`);
    return;
  };
  return value;
};

export const getClientData = (key: string, callback: (params: unknown) => void) => {
  const clientLink = getState("clientLink");
  getData({ path: `/clientLinks/${clientLink}`, key, callback});
};

export const updateClientData = (key: string, value) => {
  const clientLink = getState("clientLink");
  updateData(`clientLinks/${clientLink}/${key}`, value);
};

