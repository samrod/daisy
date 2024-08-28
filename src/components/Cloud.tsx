import { useEffect, useRef, useState } from "react";
import Styles from "./Cloud.module.scss";

interface CloudProps {
  scaleX?: number;
  scaleY?: number;
  offset?: number;
}

export const Cloud = ({ scaleX = 1, scaleY = 1, offset = 0 }: CloudProps) => {
  const seed = useRef(Math.round(Math.random() * 1000));
  const style = {
    transform: `scale(${scaleX}, ${scaleY}) translateY(${offset}vh)`,
    animationDuration: `${240/(scaleX*2)}s`,
  };
  return (
    <div style={style} className={Styles.cloud}>
      <div
        style={{
          width: `${scaleX*166}px`,
          height: `${scaleY*80}px`,
          boxShadow: `0px ${scaleY*40+220}px ${scaleY*50}px #fffC`,
        }}
        className={Styles.back}
      />
      <div
        style={{
          width: `${scaleX*146}px`,
          height: `${scaleY*20}px`,
          boxShadow: `20px ${scaleY*0+220}px ${scaleY*40}px #777`,
        }}
        className={Styles.mid}
      />
      <div
        style={{
          width: `${scaleX*153}px`,
          height: `${scaleY*10}px`,
          boxShadow: `20px ${scaleY*10+220}px ${scaleY*25}px #339`,
        }}
        className={Styles.front}
      />

      <svg width={0} height={0}>
        <filter id="filter-back">
          <feTurbulence type="fractalNoise" baseFrequency={0.02} numOctaves={4} seed={seed.current} />
          <feDisplacementMap in="SourceGraphic" scale={100}  />
        </filter>
        <filter id="filter-mid">
          <feTurbulence type="fractalNoise" baseFrequency={0.05} numOctaves={3} seed={seed.current} />
          <feDisplacementMap in="SourceGraphic" scale={70}  />
        </filter>
        <filter id="filter-front">
          <feTurbulence type="fractalNoise" baseFrequency={0.03} numOctaves={2} seed={seed.current} />
          <feDisplacementMap in="SourceGraphic" scale={30}  />
        </filter>
      </svg>
    </div>
  );
};

interface CloudsProps {
  cloudData: CloudProps[]
  delay?: number;
}

export const Clouds = ({ cloudData, delay = 0 }: CloudsProps) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(setReady.bind(null, true), delay * 1000);
    return () => {
      clearTimeout(timer);
    }
  }, [setReady, delay])

  return !ready ? null : (
    <>
      {cloudData.map((datum, index) => <Cloud key={`cloud-${index}`} {...datum} />)}
    </>
  );
};
