import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

export function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration: 0.5,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value]);

  return <>{display}</>;
}
