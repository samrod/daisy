import { findIndex } from "lodash";
import {
  DB_GUIDES, DB_LINKS, DB_PRESETS, DataType, deleteDataAtIndex,
  deletePropValue, getData, pushData, readPropValue, updateData, uuid,
} from "lib";
import { getGuideData, guidePropExists, updateGuideData, updateLinkData, useGuideState } from ".";
import { Dispatch } from "react";

export const getSettingsFromPreset = async (key: string): Promise<SettingsTypes> => {
  if (!key) {
    return;
  }
  const response = await readPropValue(`${DB_PRESETS}/`, key);
  if (isDefaultType(response)) {
    return response as SettingsTypes;
  }
  return;
};

export const selectPreset = async (preset: string) => {
  const settings = await getSettingsFromPreset(preset); 
  updateLinkData("settings", settings);
  updateLinkData("preset", preset);
};

interface CreatePreset {
  settings?: SettingsTypes;
  name?: string;
}

export const updatePresetData = async (path, value) => {
  await updateData(`${DB_PRESETS}/${path}`, value);
};

export const createPreset = async ({ settings, name }: CreatePreset) => {
  const { user } = useGuideState.getState();
  if (!user?.uid ) {
    return;
  }
  const presetId = uuid();
  await updateGuideData("activePreset", presetId);
  if (!settings) {
    const clientLink = await readPropValue(`${DB_GUIDES}/${user.uid}`, "clientLink");
    const liveSettings = await readPropValue(`${DB_LINKS}/${ clientLink}`, "settings") as DataType;
    await updateData(`${DB_PRESETS}/${presetId}`, liveSettings);
  } else {
    await updateData(`${DB_PRESETS}/${presetId}`, settings);
  }
  getGuideData("activePreset", selectPreset);
  await pushData(`${DB_GUIDES}/${user.uid}/${DB_PRESETS}`, { id: presetId, name: "" })
};

export const updatePresetFromClientLink = async (id: string) => {
  const { user } = useGuideState.getState();
  if (!user?.uid ) {
    return;
  }
  const clientLink = await readPropValue(`${DB_GUIDES}/${user.uid}`, "clientLink");
  const settings = await readPropValue(`${DB_LINKS}/${clientLink}`, "settings");
  updatePresetData(id, settings);
};

export const getPresetData = async (id: string, callback: Dispatch<React.SetStateAction<SettingsTypes>>) => {
  getData({ path: DB_PRESETS, key: id, callback });
};

interface PresetsTypes {
  id: string;
  name: string;
}

export const deletePreset = async (id: string) => {
  const { user } = useGuideState.getState();
  if (!user?.uid ) {
    return;
  }
  const presets = await guidePropExists(DB_PRESETS) as PresetsTypes[];
  const index = findIndex(Object.values(presets), { "id": id });
  console.log("*** deletePreset: ", index);
  await deletePropValue(DB_PRESETS, id);
  await deleteDataAtIndex(`${DB_GUIDES}/${user.uid}/presets/`, index);
};

function isDefaultType(response: any = {}): response is SettingsTypes {
  return (
    'size' in response &&
    'speed' in response &&
    'angle' in response &&
    'pitch' in response &&
    'volume' in response &&
    'wave' in response &&
    'length' in response &&
    'background' in response &&
    'opacity' in response &&
    'lightbar' in response &&
    'steps' in response &&
    'color' in response &&
    'shape' in response &&
    'playing' in response
  );
}
