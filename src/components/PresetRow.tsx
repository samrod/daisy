import { memo, useCallback, useMemo, useState } from "react";

import { Button, EditField, Thumbnail } from "components";
import { pushGuidePrest } from "state";
import { sendMessage } from "lib";
import Styles from "./Presets.module.scss";

export interface PresetData {
  id: string;
  name: string;
  settings: SettingsTypes;
  index?: number;
  required: boolean;
}

export const _PresetRow = (props: PresetData) => {
  const [loading, setLoading] = useState(false);
  const { settings, name, index, id, required } = props;
  const memoizedSettings = useMemo(() => settings, [settings]);
  const { speed, angle, pitch, volume, wave, length, steps } = settings;

  const onDelete = useCallback(() => {
    sendMessage({ action: "showModal", params: showDeletePresetModal(props) });
  }, [props]);

  const onUpdate = useCallback(() => {
    sendMessage({ action: "showModal", params: showUpdatePresetModal(props) });
  }, [props]);

  const savePreset = useCallback(async (name) => {
    setLoading(true);
    await pushGuidePrest(index, { name, id });
    setLoading(false);
  }, [index, id]);

  if (!memoizedSettings) {
    return null;
  }

  return (
    <tr>
      <td className={Styles.thumbnail}>
        <Thumbnail settings={memoizedSettings} id={id} />
      </td>
      <td className={Styles.name}>
        <EditField
          onSubmit={savePreset}
          onAbort={onDelete}
          loading={loading}
          value={name}
          placeholder="preset name"
          autoFocus
        />
      </td>
      <td>{speed}</td>
      <td>{steps}</td>
      <td>{angle}</td>
      <td>{wave}</td>
      <td>{length}</td>
      <td>{volume}</td>
      <td>{pitch}</td>
      <td className={Styles.actions}>
        {!required ? <Button customClass={Styles.delete} onClick={onDelete} circle={25} value="&#10006;" /> : null}
        <Button customClass={Styles.update} onClick={onUpdate} circle={25} value="&#x21ba;" />
      </td>
    </tr>
  );
};

const isEqual = (prev: SettingsTypes, next: SettingsTypes) => (
  JSON.stringify(prev.settings) === JSON.stringify(next.settings) &&
  prev.name === next.name &&
  prev.index === next.index &&  
  prev.id === next.id &&
  prev.required === next.required
);

export const PresetRow = memo(_PresetRow, isEqual);

export const showDeletePresetModal = ({ name, id }) => ({
  title: `Delete preset?`,
  body: `Are you sure you want to delete "${name}"?`,
  cancel: {
    text: "Cancel",
    action: ["onCancelPresetAction"],
  },
  accept: {
    text: "Delete",
    action: ["onConfirmDeletePreset", id],
  },
});

export const showUpdatePresetModal = ({ name, id }) => ({
  title: `Update preset?`,
  body: `Are you sure you want to update "${name}" with current settings?`,
  cancel: {
    text: "Cancel",
    action: ["onCancelPresetAction"],
  },
  accept: {
    text: "Delete",
    action: ["onConfirmUpdatePreset", id],
  },
});
