import { findIndex } from "lodash";
import { Dispatch } from "react";
import {
  DB_GUIDES, DB_LINKS, DB_PRESETS, deleteDataAtIndex, deletePropValue,
  getData, pushData, readPropValue, updateData, uuid, defaults, NEW_PRESET_NAME,
} from "lib";
import { getGuideData, guidePropExists, updateGuideData, updateLinkData, useGuideState } from ".";

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

export const createPreset = async ({ settings, name = NEW_PRESET_NAME }: CreatePreset) => {
  const { user } = useGuideState.getState();
  if (!user?.uid ) {
    return;
  }
  const presetId = uuid();
  await updateGuideData("activePreset", presetId);
  if (!settings) {
    const clientLink = await readPropValue(`${DB_GUIDES}/${user.uid}`, "clientLink");
    const liveSettings: SettingsTypes = await readPropValue(`${DB_LINKS}/${ clientLink}`, "settings") || defaults;
    await updateData(`${DB_PRESETS}/${presetId}`, liveSettings);
    await pushData(`${DB_GUIDES}/${user.uid}/${DB_PRESETS}`, { id: presetId, name })
  } else {
    await pushData(`${DB_GUIDES}/${user.uid}/${DB_PRESETS}`, { id: presetId, name })
    await updateData(`${DB_PRESETS}/${presetId}`, settings);
  }
  getGuideData("activePreset", selectPreset);
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

export interface PresetsTypes {
  id: string;
  name: string;
}

export const deletePreset = async (id: string) => {
  const { user, setActivePreset } = useGuideState.getState();
  if (!user?.uid ) {
    return;
  }
  const presets = await guidePropExists(DB_PRESETS) as PresetsTypes[];
  const index = findIndex(Object.values(presets), { "id": id });
  const activePreset = await readPropValue(`${DB_GUIDES}/${user.uid}`, "activePreset");
  if (id === activePreset) {
    setActivePreset("");
  }
  await deleteDataAtIndex(`${DB_GUIDES}/${user.uid}/${DB_PRESETS}/`, index);
  await deletePropValue(DB_PRESETS, id);
};

function isDefaultType(response: any = {}): response is SettingsTypes {
  return (
    'size' in response &&
    'speed' in response &&
    'angle' in response &&
    'pitch' in response &&
    'duration' in response &&
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
