"use client";

import { useRef, useState } from "react";
import "@/features/marketing/components/PresenceMap.presence.css";

/** Approximate, fictional placements across Pune neighbourhood clusters. */
const PIN_COORDS: [number, number][] = [
  [18, 24], [22, 28], [16, 32], [24, 22], [20, 36], [14, 40],
  [28, 18], [32, 24], [36, 20], [40, 16], [34, 30], [38, 26],
  [44, 22], [48, 18], [52, 24], [56, 20], [60, 28], [64, 22],
  [68, 30], [72, 26], [66, 36], [70, 40], [74, 34], [58, 34],
  [42, 36], [46, 40], [50, 38], [54, 42], [48, 46], [52, 50],
  [30, 42], [26, 48], [34, 50], [22, 52], [28, 56], [36, 54],
  [40, 58], [44, 62], [50, 58], [56, 56], [60, 52], [64, 48],
  [18, 46], [12, 50], [16, 56], [24, 60], [32, 64], [38, 68],
  [46, 66], [54, 64],
];

export function PresenceMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function placeTooltip(pin: HTMLElement) {
    const map = mapRef.current;
    if (!map) return;
    const mapRect = map.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();
    setTooltip({
      left: pinRect.left - mapRect.left + pinRect.width / 2,
      top: pinRect.top - mapRect.top,
    });
  }

  function clearTooltip() {
    setTooltip(null);
    setActiveIndex(null);
  }

  return (
    <div
      className="presence-map presence-map-gmaps"
      data-presence-map
      ref={mapRef}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target === mapRef.current || target.closest(".presence-map-art")) {
          clearTooltip();
        }
      }}
    >
      <svg
        className="presence-map-art"
        viewBox="0 0 800 560"
        role="img"
        aria-label="Map-style view of Pune showing approximate Nivarak family locations"
      >
        <defs>
          <pattern
            id="presence-block"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <rect width="48" height="48" fill="#e8eaed" />
            <rect x="1" y="1" width="46" height="46" fill="#f1f3f4" />
          </pattern>
          <filter
            id="presence-pin-shadow"
            x="-40%"
            y="-20%"
            width="180%"
            height="160%"
          >
            <feDropShadow
              dx="0"
              dy="1.5"
              stdDeviation="1.2"
              floodColor="#000"
              floodOpacity="0.28"
            />
          </filter>
        </defs>
        <rect width="800" height="560" fill="#e8eaed" />
        <rect width="800" height="560" fill="url(#presence-block)" opacity="0.55" />
        <g fill="#f8f9fa" stroke="#dadce0" strokeWidth="0.75">
          <rect x="60" y="70" width="140" height="90" rx="2" />
          <rect x="220" y="60" width="160" height="110" rx="2" />
          <rect x="400" y="50" width="130" height="95" rx="2" />
          <rect x="550" y="70" width="170" height="120" rx="2" />
          <rect x="50" y="200" width="120" height="100" rx="2" />
          <rect x="190" y="210" width="150" height="115" rx="2" />
          <rect x="360" y="190" width="170" height="130" rx="2" />
          <rect x="550" y="230" width="160" height="105" rx="2" />
          <rect x="80" y="340" width="150" height="100" rx="2" />
          <rect x="250" y="360" width="170" height="110" rx="2" />
          <rect x="450" y="370" width="160" height="95" rx="2" />
          <rect x="630" y="360" width="110" height="120" rx="2" />
        </g>
        <g fill="#e6f4ea" stroke="#c8e6c9" strokeWidth="1">
          <ellipse cx="170" cy="160" rx="48" ry="32" />
          <ellipse cx="470" cy="150" rx="55" ry="36" />
          <ellipse cx="320" cy="420" rx="60" ry="34" />
          <ellipse cx="640" cy="280" rx="42" ry="28" />
          <path d="M580 430 C610 410, 660 415, 690 445 C670 470, 620 475, 590 455 Z" />
        </g>
        <path
          d="M20 265 C110 245, 190 280, 280 268 S430 230, 520 248 S650 295, 790 275"
          fill="none"
          stroke="#a5d7f7"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path
          d="M20 265 C110 245, 190 280, 280 268 S430 230, 520 248 S650 295, 790 275"
          fill="none"
          stroke="#c2e7ff"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <g fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
          <path d="M40 120 H760" />
          <path d="M40 180 H760" />
          <path d="M40 320 H760" />
          <path d="M40 380 H760" />
          <path d="M40 460 H760" />
          <path d="M120 40 V520" />
          <path d="M200 40 V520" />
          <path d="M300 40 V520" />
          <path d="M420 40 V520" />
          <path d="M520 40 V520" />
          <path d="M620 40 V520" />
          <path d="M720 40 V520" />
        </g>
        <g
          fill="none"
          stroke="#dadce0"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.9"
        >
          <path d="M40 120 H760" />
          <path d="M40 180 H760" />
          <path d="M40 320 H760" />
          <path d="M40 380 H760" />
          <path d="M40 460 H760" />
          <path d="M120 40 V520" />
          <path d="M200 40 V520" />
          <path d="M300 40 V520" />
          <path d="M420 40 V520" />
          <path d="M520 40 V520" />
          <path d="M620 40 V520" />
          <path d="M720 40 V520" />
        </g>
        <g fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round">
          <path d="M30 290 H770" />
          <path d="M250 30 V530" />
          <path d="M70 480 C200 430, 340 300, 480 210 S680 120, 780 100" />
          <path d="M90 60 C180 170, 250 300, 340 430 S500 520, 700 500" />
        </g>
        <g fill="none" stroke="#bdc1c6" strokeWidth="1.25" strokeLinecap="round">
          <path d="M30 290 H770" />
          <path d="M250 30 V530" />
          <path d="M70 480 C200 430, 340 300, 480 210 S680 120, 780 100" />
          <path d="M90 60 C180 170, 250 300, 340 430 S500 520, 700 500" />
        </g>
        <path
          d="M40 340 H760"
          fill="none"
          stroke="#fbbc04"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M40 340 H760"
          fill="none"
          stroke="#fef7e0"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <g fontFamily="Roboto, Arial, Helvetica, sans-serif">
          <text x="145" y="125" fill="#188038" fontSize="11" fontWeight="500">
            Baner Hills
          </text>
          <text x="440" y="135" fill="#188038" fontSize="11" fontWeight="500">
            Osho Garden
          </text>
          <text x="150" y="155" fill="#5f6368" fontSize="12" fontWeight="600">
            Aundh
          </text>
          <text x="230" y="100" fill="#5f6368" fontSize="12" fontWeight="600">
            Baner
          </text>
          <text x="530" y="105" fill="#5f6368" fontSize="12" fontWeight="600">
            Viman Nagar
          </text>
          <text x="95" y="255" fill="#5f6368" fontSize="12" fontWeight="600">
            Pimpri
          </text>
          <text x="340" y="250" fill="#202124" fontSize="14" fontWeight="700">
            Deccan
          </text>
          <text x="565" y="285" fill="#5f6368" fontSize="12" fontWeight="600">
            Kharadi
          </text>
          <text x="200" y="395" fill="#5f6368" fontSize="12" fontWeight="600">
            Kothrud
          </text>
          <text x="455" y="445" fill="#5f6368" fontSize="12" fontWeight="600">
            Hadapsar
          </text>
          <text x="640" y="420" fill="#5f6368" fontSize="11" fontWeight="600">
            Magarpatta
          </text>
          <text x="360" y="335" fill="#1a73e8" fontSize="11" fontWeight="500">
            Pune
          </text>
        </g>
        <g transform="translate(742, 420)">
          <rect width="36" height="72" rx="4" fill="#fff" stroke="#dadce0" strokeWidth="1" />
          <path d="M18 16 L24 24 H12 Z" fill="#5f6368" />
          <line x1="8" y1="36" x2="28" y2="36" stroke="#dadce0" />
          <path d="M18 56 L12 48 H24 Z" fill="#5f6368" />
        </g>
      </svg>

      <div className="presence-pins" data-presence-pins>
        {PIN_COORDS.map(([left, top], i) => (
          <button
            key={i}
            type="button"
            className={`presence-pin${activeIndex === i ? " is-active" : ""}`}
            style={{ left: `${left}%`, top: `${top}%` }}
            aria-label="Nivarak family in Pune"
            onMouseEnter={(e) => {
              setActiveIndex(i);
              placeTooltip(e.currentTarget);
            }}
            onMouseLeave={clearTooltip}
            onFocus={(e) => {
              setActiveIndex(i);
              placeTooltip(e.currentTarget);
            }}
            onBlur={clearTooltip}
            onClick={(e) => {
              e.stopPropagation();
              if (activeIndex === i && tooltip) {
                clearTooltip();
                return;
              }
              setActiveIndex(i);
              placeTooltip(e.currentTarget);
            }}
          />
        ))}
      </div>
      <div
        className="presence-tooltip"
        data-presence-tooltip
        role="tooltip"
        hidden={!tooltip}
        style={
          tooltip
            ? { left: `${tooltip.left}px`, top: `${tooltip.top}px` }
            : undefined
        }
      >
        Nivarak family · Pune
      </div>
    </div>
  );
}
