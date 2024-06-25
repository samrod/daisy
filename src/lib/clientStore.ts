import { isEmpty } from "lodash";
import { getData, updateData, useGuideState, useClientState } from ".";

const getState = (key: string) => {
  const guideState = useGuideState.getState();
  const clientState = useClientState.getState();
  const value = guideState[key] || clientState[key];

  if (!isEmpty(value)) {
    return value;
  };
};

export const getClientData = (key: string, callback: (params: unknown) => void) => {
  const clientLink = getState("clientLink");
  if (clientLink) {
    // console.log(`*** ${window.location.pathname} getClientData:`, key);
    getData({ path: `/clientLinks/${clientLink}`, key, callback});
  }
};

export const updateClientData = (key: string, value) => {
  const clientLink = getState("clientLink");
  if (clientLink) {
    updateData(`clientLinks/${clientLink}/${key}`, value);
  }
};

