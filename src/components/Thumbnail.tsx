import { memo, useCallback, useEffect, useRef, useState } from "react";
import { RotatingLines } from "react-loader-spinner";
import { createPortal } from "react-dom";

import { Display } from "components";
import Styles from "./Presets.module.scss";

interface ThumbnailProps {
  settings: SettingsTypes;
  id: string;
}

const _Thumbnail = ({ settings, id }: ThumbnailProps) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeKey, setIframeKey] = useState(id);
  const displayRef = useRef<HTMLIFrameElement>();
  const iframeMountNode = displayRef.current?.contentWindow?.document?.body;

  const onIframeLoad = useCallback(() => {
    setIframeLoaded(true);
  }, []);
  
  useEffect(() => {
    setIframeKey(id);
  }, [id]);

  if (!settings) {
    return null;
  }

  return (
    <>
      {!iframeLoaded && (
        <div className={Styles.spinner}>
          <RotatingLines
            width="50"
            strokeColor="black"
            strokeWidth="3"
            animationDuration="0.25s"
          />
        </div>
      )}
      <iframe
        key={`iframe-${iframeKey}`}
        title={`thumb-${id}`}
        ref={displayRef}
        src="/thumb"
        onLoad={onIframeLoad}
      >
        {iframeLoaded && iframeMountNode &&
          createPortal(
            <Display settings={settings} preview={true} />,
            iframeMountNode
          )
        }
      </iframe>
    </>
  );
}

const isEqual = (prev: SettingsTypes, next: SettingsTypes) => (
  JSON.stringify(prev.settings) === JSON.stringify(next.settings) &&
  prev.id === next.id
);

export const Thumbnail = memo(_Thumbnail, isEqual);
