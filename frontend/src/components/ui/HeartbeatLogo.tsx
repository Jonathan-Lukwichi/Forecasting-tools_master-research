"use client";

interface HeartbeatLogoProps {
  size?: number;
  className?: string;
}

export default function HeartbeatLogo({ size = 32, className = "" }: HeartbeatLogoProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 shadow-md shadow-blue-200 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: size * 0.55, height: size * 0.55 }}
      >
        <path d="M3 12h4l3-9 4 18 3-9h4" />
      </svg>
    </div>
  );
}
