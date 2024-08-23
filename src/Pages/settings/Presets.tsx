import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { createPreset, getGuideData, getSettingsFromPreset, pushGuidePrest, useGuideState } from "state";
import { Button, Col, Display, EditField } from "components";
import { DB_PRESETS, defaults, sendMessage } from "lib";
import Styles from "./UserPanel.module.scss";

import { ReactComponent as IconAngle } from "assets/setting_angle.svg";
import { ReactComponent as IconFrequency } from "assets/setting_frequency.svg";
import { ReactComponent as IconLength } from "assets/setting_length.svg";
// import { ReactComponent as IconPitch } from "assets/setting_pitch.svg";
import { ReactComponent as IconSpeed } from "assets/setting_speed.svg";
import { ReactComponent as IconSteps } from "assets/setting_steps.svg";
import { ReactComponent as IconVolume } from "assets/setting_volume.svg";
import { ReactComponent as IconWave } from "assets/setting_wave.svg";

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
  const { settings, name, index, id } = props;
  const { speed, angle, pitch, volume, wave, length, steps } = settings;
  const displayRef = useRef<HTMLIFrameElement>();
  const iframeMountNode = displayRef.current?.contentWindow?.document?.body;

  const onDelete = useCallback(() => {
    sendMessage({ action: "showModal", params: showDeletePresetModal(props) });
  }, [props]);

  const onUpdate = useCallback(() => {
    sendMessage({ action: "showModal", params: showUpdatePresetModal(props) });
  }, [props]);

  const savePreset = useCallback(async (name) => {
    console.log("*** saving name: ", name);
    await pushGuidePrest(index, { name, id });
    console.log("*** saved");
  }, [index, id]);

  if (!settings) {
    return null;
  }

  return (
    <tr>
      <td className={Styles.thumbnail}>
        <iframe title={`thumb-${id}`} ref={displayRef} src="/thumb">
          {iframeMountNode && createPortal(<Display settings={settings} />, iframeMountNode)}
        </iframe>
      </td>
      <td className={Styles.name}>
        <EditField value={name} onSubmit={savePreset} />
      </td>
      <td>{speed}</td>
      <td>{steps}</td>
      <td>{angle}</td>
      <td>{wave}</td>
      <td>{length}</td>
      <td>{volume}</td>
      <td>{pitch}</td>
      <td className={Styles.actions}>
        <Button customClass={Styles.update} onClick={onUpdate} circle={25} value="&#x21ba;" />
        {index ? <Button customClass={Styles.delete} onClick={onDelete} circle={25} value="&#10006;" /> : null}
      </td>
    </tr>
  );
};

export const Presets = () => {
  const [settings, setSettings] = useState<PresetData[]>([]);
  const { presets, setPresets } = useGuideState(state => state);

  const fetchPresets = useCallback(async () => {
    console.log("*** Presets: ", presets);
    const fetchedPresets = await Promise.all(
      Object.values(presets).map(async ({ id, name }) => {
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

  useEffect(() => {
    fetchPresets();
  }, [presets, fetchPresets])
  
  useEffect(() => {
    getGuideData(DB_PRESETS, setPresets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  return (
    <Col items="start">
      <Col nowrap self="stretch">
        <table className={Styles.settingsTable}>
          <thead>
            <tr>
              <th className={Styles.thumbnail} />
              <th className={Styles.name}/>
              <th><IconSpeed title="Speed" /></th>
              <th><IconSteps title="Steps" /></th>
              <th><IconAngle title="Angle" /></th>
              <th><IconWave title="Wave" /></th>
              <th><IconLength title="Length" /></th>
              <th><IconVolume title="Volume" /></th>
              <th><IconFrequency title="Frequency" /></th>
              <th className={Styles.actions} />
            </tr>
          </thead>
          <tbody>
            {settings?.map((preset, index) => (
              <Preset key={preset.id} {...preset} index={index} />
            ))}
          </tbody>
        </table>
      </Col>
      <Button value="Add" onClick={onAddPreset} size="sm" />
    </Col>
  );
};
