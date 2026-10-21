// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useState } from "react";
import { FadeUp } from "../Animations/gsapAnim";

const formatTime = (zone: string) =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: zone }).format(new Date());

const StudioAside = () => {
  const [times, setTimes] = useState<string[]>(STUDIOS.map(() => ""));

  useEffect(() => {
    const tick = () => setTimes(STUDIOS.map((studio) => formatTime(studio.zone)));
    tick();
    const timer = window.setInterval(tick, 30000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <aside className="flex flex-col gap-10 max-md:gap-8">
      {STUDIOS.map((studio, index) => (
        <FadeUp key={studio.city} delay={index * 0.08} className="flex flex-col gap-3">
          <h3 className="font-mpx-body text-22 font-medium text-mpx-muted">
            {studio.city} <span className="tabular-nums">{times[index]}</span>
          </h3>
          <address className="text-28 not-italic">
            <span className="block">{studio.lines[0]}</span>
            <span className="block">{studio.lines[1]}</span>
          </address>
        </FadeUp>
      ))}
    </aside>
  );
};

export default StudioAside;

const STUDIOS = [
  { city: "Delhi", zone: "Asia/Kolkata", lines: ["14 Hauz Khas Village", "New Delhi 110016"] },
  { city: "London", zone: "Europe/London", lines: ["22 Redchurch Street", "London E2 7DJ"] },
  { city: "Dubai", zone: "Asia/Dubai", lines: ["Alserkal Avenue, Warehouse 47", "Al Quoz, Dubai"] },
  { city: "New York", zone: "America/New_York", lines: ["88 Walker Street", "New York, NY 10013"] },
];
