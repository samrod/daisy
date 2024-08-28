import { Display } from "components";
import Styles from "./Presets.module.scss";

interface ThumbnailProps {
  settings: SettingsTypes;
}

export const Thumbnail = ({ settings }: ThumbnailProps) => {
  if (!settings) {
    return null;
  }

  return (
    <div className={Styles.thumb}>
      <Display settings={settings} preview={true} />
    </div>
  );
}
