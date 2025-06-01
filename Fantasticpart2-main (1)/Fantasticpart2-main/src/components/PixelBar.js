import React from "react";

// Pixel-art bar: 120x20px, outline hitam pixel, ujung bulat pixel (pakai path), fill solid
// Value: 0-100
// Color: merah (0-25), oranye (26-50), kuning (51-75), hijau (76-100)
const getBarColor = (value) => {
  if (value <= 25) return "#ff2222"; // merah
  if (value <= 50) return "#ff9900"; // oranye
  if (value <= 75) return "#ffe600"; // kuning
  return "#44d800"; // hijau
};

export default function PixelBar({ value = 100, label = "", style = {} }) {
  // Bar pixel-art: 120x20, outline 2px, ujung pixel, fill kotak
  const barWidth = 120;
  const barHeight = 20;
  const outline = 2;
  const fillMax = barWidth - outline * 2;
  const fillWidth = Math.round(fillMax * (value / 100));
  const color = getBarColor(value);

  // Path for pixel-art rounded bar (mirip contoh)
  // Kiri: 3 pixel diagonal, kanan: 3 pixel diagonal
  // Outline: hitam, isi: putih, fill: warna
  // Highlight: kotak pixel di atas fill

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", ...style }}>
      {label && (
        <span
          style={{
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: 10,
            color: "#222",
            marginBottom: 2,
            marginLeft: 2,
            textShadow: "1px 1px 0 #fff, -1px -1px 0 #fff",
            letterSpacing: 0.5,
          }}
        >
          {label}
        </span>
      )}
      <svg
        width={barWidth}
        height={barHeight}
        style={{ imageRendering: "pixelated", display: "block" }}
      >
        {/* Outline pixel-art (pakai path) */}
        <path
          d="M4,1 L116,1 L119,4 L119,16 L116,19 L4,19 L1,16 L1,4 Z"
          fill="#000"
        />
        {/* Isi putih pixel-art */}
        <path
          d="M6,3 L114,3 L117,6 L117,14 L114,17 L6,17 L3,14 L3,6 Z"
          fill="#fff"
        />
        {/* Fill warna solid pixel, kotak, tanpa rounded */}
        {fillWidth > 0 && (
          <clipPath id="barFillClip">
            <path d="M6,3 L114,3 L117,6 L117,14 L114,17 L6,17 L3,14 L3,6 Z" />
          </clipPath>
        )}
        {fillWidth > 0 && (
          <rect
            x={6}
            y={3}
            width={Math.max(0, Math.min(fillWidth, 111))}
            height={14}
            fill={color}
            clipPath="url(#barFillClip)"
          />
        )}
        {/* Highlight pixel (kotak putih semi transparan di atas fill) */}
        {fillWidth > 12 && (
          <rect
            x={8}
            y={5}
            width={Math.max(0, Math.min(fillWidth - 6, 100))}
            height={3}
            fill="#fff"
            opacity={0.22}
            clipPath="url(#barFillClip)"
          />
        )}
      </svg>
    </div>
  );
} 