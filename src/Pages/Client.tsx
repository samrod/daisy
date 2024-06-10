import { useCallback, useEffect, useRef } from 'react';
import { isEmpty } from 'lodash';

import { bindAllSettingsToValues } from "../lib/store";
import { useClientState } from '../lib/clientState';
import { useGuideState } from "../lib/guideState";
import { Display } from "../components";
import { bindEvent } from '../lib/utils';
import { ReactComponent as Logo } from "../assets/daisy-logo.svg"

const Guide = () => {
  const { preset, setClientLink, status, setStatus } = useClientState(state => state);
  const { setActivePreset } = useGuideState(state => state);
  const bindList = useRef<BindParams[]>();

  const findGuide = useCallback(async () => {
    bindAllSettingsToValues();
    setStatus(1);
  }, [setStatus]);

  const bindEvents = useCallback(() => {
    bindList.current = [
      { event: 'beforeunload', element: window, handler: setStatus.bind(null, 0)},
      { event: 'unload', element: window, handler: setStatus.bind(null, 0)},
    ];

    bindList.current.forEach(bindEvent);
  }, [setStatus]);

  useEffect(() => {
    if (!isEmpty(preset)) {
      setActivePreset(preset);
      findGuide();
    }
  }, [findGuide, preset, setActivePreset]);

  useEffect(() => {
    setClientLink();
    bindEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status !== 3) {
    return (
      <div>
        <Logo />
        <h1>Welcome</h1>
      </div>
    );
  }
  return (
    <Display />
  )
};

export default Guide;
