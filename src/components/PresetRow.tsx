import { useCallback, useEffect, useState } from "react";

import { Button, EditField, Thumbnail } from "components";
import { getPresetData, pushGuideData, updateGuideData, useGuideState } from "state";
import { DB_PRESETS, limits, sendMessage } from "lib";
import Styles from "./Presets.module.scss";

export interface PresetData {
  id: string;
  name: string;
  settings: SettingsTypes;
  index?: number;
  required: boolean;
}

export const PresetRow = (props: PresetData) => {
  const { activePreset } = useGuideState(state => state);
  const { settings: _settings, name, index, id, required } = props;
  const activeClass = activePreset === id ? Styles.active : "";
  const [settings, setSettings] = useState(_settings);
  const [loading, setLoading] = useState(false);
  const [validSettings, setValidSettings] = useState(true);
  let speed, angle, pitch, duration, volume, wave, length, steps;

  try {
    ({ speed, angle, pitch, duration, volume, wave, length, steps } = settings);
  } catch (e) {
    console.warn("*** PresetRow missing data: ", id, index, name, e)
    setValidSettings(false);
  }

  const onDelete = useCallback(() => {
    sendMessage({ action: "showModal", params: showDeletePresetModal(props) });
  }, [props]);

  const onUpdate = useCallback(async () => {
    sendMessage({ action: "showModal", params: showUpdatePresetModal(props) });
  }, [props]);
  
  const savePresetName = useCallback(async (name: string) => {
    setLoading(true);
    await pushGuideData(DB_PRESETS, { name, id }, index);
    setLoading(false);
  }, [index, id]);

  const onActivate = useCallback( async (e) => {
    e.stopPropagation();
    updateGuideData("activePreset", id);
  }, [id]);

  useEffect(() => {
    getPresetData(id, setSettings);
  }, [id]);

  if (!validSettings) {
    return null;
  }

  return (
    <tr onClick={onActivate} className={activeClass}>
      <td className={Styles.thumbnail}>
        <Thumbnail settings={settings} />
      </td>
      <td className={Styles.name}>
        <EditField
          onSubmit={savePresetName}
          onAbort={onDelete}
          loading={loading}
          value={name}
          placeholder="preset name"
          autoFocus
        />
      </td>
      <td>{speed}</td>
      <td>{steps}</td>
      <td>{angle}<span className={Styles.symbol}>&ang;</span></td>
      <td>{wave}</td>
      <td>{length}</td>
      <td>{Math.round(volume/limits.volume.max*100)}<span className={Styles.unit}>%</span></td>
      <td>{pitch}<span className={Styles.unit}>Hz</span></td>
      <td>{duration}<span className={Styles.unit}>ms</span></td>
      <td className={Styles.actions}>
        {!required ? <Button customClass={Styles.delete} onClick={onDelete} circle={25} value="&#10006;" /> : null}
        <Button customClass={Styles.update} onClick={onUpdate} circle={25} value="&#x21ba;" />
      </td>
    </tr>
  );
};

export const showDeletePresetModal = ({ name, id }) => ({
  title: `Delete preset?`,
  body: `Are you sure you want to delete "${name}"?`,
  accept: {
    text: "Delete",
    action: ["onConfirmDeletePreset", id],
  },
});

export const showUpdatePresetModal = ({ name, id }) => ({
  title: `Update preset?`,
  body: `Are you sure you want to overwrite "${name}" with the current settings?`,
  accept: {
    text: "Overwrite",
    action: ["onConfirmUpdatePreset", id],
  },
});
