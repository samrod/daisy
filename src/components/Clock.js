import React, { useRef, useEffect } from 'react';
import Timer from 'react-compound-timer';
import './Clock.scss';

const Clock = ({ playing, startTime }) => {
  const timer = useRef();
  const initialTime = () => {
    return startTime ? new Date().getTime() - startTime : new Date().getTime();
  };

  useEffect(() => {
    if (!timer.current) {
      return;
    }
    if (playing) {
      timer.current.reset();
      timer.current.start();
    } else {
      timer.current.pause();
    }
  }, [playing]);

  const formatSecs = s => s.toString().padStart(2, 0);

  const formatHours = h => h && `${h}:`;

  return (
    <Timer
      ref={timer}
      initialTime={initialTime()}
      startImmediately={playing}
    >
      <div className="clock">
        <Timer.Hours formatValue={formatHours} />
        <Timer.Minutes />:
        <Timer.Seconds formatValue={formatSecs} />
      </div>
    </Timer>
  );
};

export default Clock;
