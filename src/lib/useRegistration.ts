import { useEffect, useState } from "react";
import { DEMO_REGISTRATION, getCurrentRegistration, type Registration } from "./registration";

/** Current registration from localStorage (read after hydration), or the design's sample data. */
export function useRegistration() {
  const [reg, setReg] = useState<Registration>(DEMO_REGISTRATION);
  const [isDemo, setIsDemo] = useState(true);
  useEffect(() => {
    const r = getCurrentRegistration();
    if (r) { setReg(r); setIsDemo(false); }
  }, []);
  return { reg, setReg, isDemo, setIsDemo };
}
