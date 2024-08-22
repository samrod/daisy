import { useCallback, useEffect, useState } from "react";
import cn from "classnames";

import { createPreset, getGuideData, getSettingsFromPreset, useGuideState } from "state";
import { Button, Col, Row } from "components";
import { DB_PRESETS, defaults, sendMessage } from "lib";
import Styles from "./UserPanel.module.scss";

interface PresetData {
  id: string;
  name: string;
  settings: typeof defaults;
  index?: number;
}

const showDeletePresetModal = ({ name, id }) => ({
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

const showUpdatePresetModal = ({ name, id }) => ({
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

const Preset = (props: PresetData) => {
  const { settings, name, index } = props;
  const { size,speed,angle,pitch,volume,wave,length,background,opacity,lightbar,steps,color,shape } = settings;

  const onDelete = useCallback(() => {
    sendMessage({ action: "showModal", params: showDeletePresetModal(props) });
  }, []);

  const onUpdate = useCallback(() => {
    sendMessage({ action: "showModal", params: showUpdatePresetModal(props) });
  }, []);

  return (
    <div>
      {name}, 
      {background}, {opacity}, {lightbar}, {steps}, {color}, {shape},
      {size}, {speed}, {angle}, {pitch}, {volume}, {wave}, {length}
      <Button customClass={cn(Styles.presetButton, Styles.update)} onClick={onUpdate} size="sm" circle={25} value="&#x21ba;" />
      {index && <Button customClass={cn(Styles.presetButton, Styles.delete)} onClick={onDelete} size="sm" circle={25} value="&#10006;" />}
    </div>
  );
};

export const Presets = () => {
  const [settings, setSettings] = useState<PresetData[]>([]);
  const { presets, setPresets } = useGuideState(state => state);

  const fetchPresets = useCallback(async () => {
    const fetchedPresets = await Promise.all(
      presets.map(async ({ id, name }) => {
        const _settings = await getSettingsFromPreset(id);
        if (!_settings) {
          return null;
        }
        return { id, name, settings: _settings };
      })
    );
    setSettings(fetchedPresets.filter(Boolean) as PresetData[]);
  }, [presets]);

  const onAddPreset = useCallback(async () => {
    await createPreset({});
  }, []);

  console.log("*** Presets: ", presets);

  useEffect(() => {
    fetchPresets();
  }, [presets, fetchPresets])
  
  useEffect(() => {
    getGuideData(DB_PRESETS, setPresets);
  }, []);

  return (
    <Col cols={5} items="start">
      <h3 className="text-center mt-3 mb-3">Preset Settings</h3>
      <Col nowrap self="stretch" klass={Styles.scrollableList}>
        {settings.map((preset, index) => (
          <Preset key={preset.id} {...preset} index={index} />
        ))}
      </Col>
      <Button value="Add" onClick={onAddPreset} size="sm" />
    </Col>
  );
};
