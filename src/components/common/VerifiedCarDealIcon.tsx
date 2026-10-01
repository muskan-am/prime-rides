import React from "react";

interface VerifiedCarDealIconProps {
  className?: string;
  size?: number | string;
}

export default function VerifiedCarDealIcon({
  className = "h-14 w-14",
  size,
}: VerifiedCarDealIconProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Verified Car Deal"
    >
      {/* Upper Car Section (Sky/Electric Blue) */}
      <g>
        {/* Car Body Silhouette */}
        <path
          d="M32 30 C33 23 37 18 45 17 L75 17 C83 18 87 23 88 30 L93 30 C96 30 98 32.5 97.5 35.5 L94.5 45 C94 46.5 92.5 47.5 90.5 47.5 L89.5 47.5 C89 54 84.5 58 76 58 L44 58 C35.5 58 31 54 30.5 47.5 L29.5 47.5 C27.5 47.5 26 46.5 25.5 45 L22.5 35.5 C22 32.5 24 30 27 30 L32 30 Z"
          fill="#0099FF"
        />
        {/* Windshield (White cut-out) */}
        <path
          d="M36 30 C38 24 43 21 48 21 L72 21 C77 21 82 24 84 30 L86 38 L34 38 L36 30 Z"
          fill="white"
        />
        {/* Front Grille (White cut-out) */}
        <path
          d="M44 48 L76 48 C77.5 48 78.5 49 78 50.5 L76.5 54 C76 55 75 55.5 74 55.5 L46 55.5 C45 55.5 44 55 43.5 54 L42 50.5 C41.5 49 42.5 48 44 48 Z"
          fill="white"
        />
        {/* Left Headlight */}
        <rect x="29" y="47" width="10" height="4" rx="2" fill="white" />
        {/* Right Headlight */}
        <rect x="81" y="47" width="10" height="4" rx="2" fill="white" />

        {/* Verified Badge (Circle + Checkmark on top-left of the car) */}
        <circle cx="28" cy="20" r="13" fill="#0099FF" stroke="white" strokeWidth="2.5" />
        <path
          d="M22 20.5 L26 24.5 L34 16"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Lower Handshake Section (Deep Navy Blue) */}
      <g fill="#17396C">
        {/* Left Sleeve / Cuff */}
        <path
          d="M10 74 L22 58 L32 65.5 L20 81.5 Z"
        />
        {/* Right Sleeve / Cuff */}
        <path
          d="M110 74 L98 58 L88 65.5 L100 81.5 Z"
        />

        {/* Handshake Hands & Grips */}
        {/* Left Hand / Thumb reaching down */}
        <path
          d="M26 63 L45 77 C48 79.5 52 80 55 78 L78 61 C82 58 87 59 89 63 C90.5 66 89.5 70 86 72.5 L73 82 C67 86.5 59 87 53 82.5 L36 69.5 L26 63 Z"
        />

        {/* Right Hand / Fingers clasping upward */}
        <path
          d="M94 63 L75 77 C72 79.5 68 80 65 78 L53 69 L59 64 L69 72 C71 73.5 74 73 75.5 71 C77 69 76.5 66.5 74.5 65 L65 57.5 C60 53.5 53 54.5 49 59.5 C46.5 63 47.5 67.5 51 70.5 L67 83 C75 89 86 87 92 80 L98 73 L94 63 Z"
        />
        
        {/* Fingers Details Underneath */}
        <path
          d="M48 83 C51 86 56 89 62 90 C67 91 73 89 78 85 L84 80 L79 76 L74 80 C70 83 65 84 61 83 C57 82 53 79.5 50 76.5 L45 80 L48 83 Z"
        />
        <path
          d="M57 91 C62 94 68 94 74 91 L78 88 L74 84 L70 87 C66 89 61 88 57 86 L53 88 L57 91 Z"
        />
      </g>
    </svg>
  );
}
