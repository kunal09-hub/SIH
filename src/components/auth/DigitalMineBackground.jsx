import React from 'react';

/**
 * DigitalMineBackground - Subtle "Digital Mine Intelligence" background
 * Combines abstract coal mine GIS mapping, underground tunnel geometry,
 * boundary contours, telemetry nodes, and subtle geological strata.
 */
export default function DigitalMineBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none bg-[#F8FAFC]">
      {/* 1. Base Ambient Canvas Layer */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Base Background Gradient */}
          <linearGradient id="mineBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="50%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#EBF3FE" />
          </linearGradient>

          {/* Technical Grid Pattern */}
          <pattern id="gisGrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="#64748B"
              strokeWidth="0.65"
              strokeOpacity="0.08"
            />
            <circle cx="48" cy="48" r="0.8" fill="#2563EB" fillOpacity="0.15" />
          </pattern>

          {/* Dense Coordinates Dot Grid */}
          <pattern id="dotSubGrid" width="144" height="144" patternUnits="userSpaceOnUse">
            <circle cx="72" cy="72" r="1.5" fill="#3B82F6" fillOpacity="0.12" />
            <path
              d="M 64 72 L 80 72 M 72 64 L 72 80"
              stroke="#2563EB"
              strokeWidth="0.6"
              strokeOpacity="0.1"
            />
          </pattern>

          {/* Center Clean Area Vignette Radial Gradient Mask */}
          <radialGradient id="centerClearMask" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </radialGradient>

          <mask id="clearCenter">
            <rect width="1440" height="900" fill="url(#centerClearMask)" />
          </mask>

          {/* Strata Shading Gradients */}
          <linearGradient id="strataGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="strataGradRight" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0F172A" stopOpacity="0.045" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Base Canvas */}
        <rect width="1440" height="900" fill="url(#mineBgGrad)" />

        {/* Global Grid Layers */}
        <rect width="1440" height="900" fill="url(#gisGrid)" />
        <rect width="1440" height="900" fill="url(#dotSubGrid)" />

        {/* ========================================================================= */}
        {/* MASKED DIGITAL MINE INTELLIGENCE ELEMENTS (Fade out in center for login card) */}
        {/* ========================================================================= */}
        <g mask="url(#clearCenter)">
          
          {/* ------------------------------------------------------------- */}
          {/* 1. TOP-LEFT: GIS Boundary Polygons & Regional Coordinates     */}
          {/* ------------------------------------------------------------- */}
          <g transform="translate(40, 40)">
            {/* Cadastral Mine Site Boundary Polygon */}
            <polygon
              points="20,40 180,20 280,90 230,220 70,190"
              fill="#2563EB"
              fillOpacity="0.025"
              stroke="#2563EB"
              strokeWidth="1.2"
              strokeOpacity="0.25"
              strokeDasharray="6 4"
            />
            {/* Sub-zone boundary */}
            <polygon
              points="70,190 230,220 190,300 40,260"
              fill="none"
              stroke="#64748B"
              strokeWidth="0.9"
              strokeOpacity="0.2"
              strokeDasharray="3 3"
            />
            
            {/* GIS Topo Contours */}
            <path
              d="M-20,120 Q120,60 260,110 T480,80"
              fill="none"
              stroke="#0284C7"
              strokeWidth="1"
              strokeOpacity="0.15"
            />
            <path
              d="M-20,160 Q140,100 280,150 T500,120"
              fill="none"
              stroke="#0284C7"
              strokeWidth="0.8"
              strokeOpacity="0.12"
              strokeDasharray="4 3"
            />

            {/* GIS Site Coordinates & Labels */}
            <text x="25" y="32" fill="#475569" fillOpacity="0.55" fontSize="9" fontFamily="monospace" fontWeight="600">
              LEASEHOLD BLOCK: DHN-04A
            </text>
            <text x="25" y="44" fill="#64748B" fillOpacity="0.45" fontSize="8" fontFamily="monospace">
              GIS: 23°47'38"N | 86°25'09"E
            </text>
            <text x="190" y="235" fill="#2563EB" fillOpacity="0.5" fontSize="8" fontFamily="monospace">
              ZONE A-3 BOUNDARY
            </text>

            {/* GIS Marker Point */}
            <circle cx="180" cy="20" r="3.5" fill="#2563EB" fillOpacity="0.6" />
            <circle cx="180" cy="20" r="8" fill="none" stroke="#2563EB" strokeWidth="0.8" strokeOpacity="0.3" className="animate-ping" style={{ animationDuration: '3.5s' }} />
          </g>

          {/* ------------------------------------------------------------- */}
          {/* 2. BOTTOM-LEFT: Underground Tunnel Geometry & Seam Strata     */}
          {/* ------------------------------------------------------------- */}
          <g transform="translate(30, 520)">
            {/* Geological Strata Silhouette (Coal Bedding) */}
            <path
              d="M-50,380 L-50,220 Q80,210 220,240 T480,210 L480,380 Z"
              fill="url(#strataGradLeft)"
            />
            <path
              d="M-50,260 Q100,245 250,275 T520,240"
              fill="none"
              stroke="#334155"
              strokeWidth="1.2"
              strokeOpacity="0.1"
            />
            <path
              d="M-50,310 Q120,295 270,320 T540,290"
              fill="none"
              stroke="#0F172A"
              strokeWidth="1"
              strokeOpacity="0.08"
              strokeDasharray="5 4"
            />

            {/* Underground Mine Shaft & Tunnel Schematic Geometry */}
            {/* Main Vertical & Incline Shaft */}
            <line x1="80" y1="40" x2="80" y2="280" stroke="#2563EB" strokeWidth="1.4" strokeOpacity="0.28" />
            <line x1="80" y1="40" x2="240" y2="180" stroke="#0284C7" strokeWidth="1.2" strokeOpacity="0.22" strokeDasharray="6 3" />
            
            {/* Cross-Cut Galleries / Drifts */}
            <line x1="80" y1="100" x2="280" y2="100" stroke="#475569" strokeWidth="1.2" strokeOpacity="0.25" />
            <line x1="80" y1="180" x2="340" y2="180" stroke="#2563EB" strokeWidth="1.4" strokeOpacity="0.3" />
            <line x1="80" y1="250" x2="290" y2="250" stroke="#475569" strokeWidth="1.2" strokeOpacity="0.2" />

            {/* Extraction Workings Pillar Grid */}
            <rect x="140" y="115" width="24" height="14" fill="none" stroke="#2563EB" strokeWidth="0.8" strokeOpacity="0.2" />
            <rect x="180" y="115" width="24" height="14" fill="none" stroke="#2563EB" strokeWidth="0.8" strokeOpacity="0.2" />
            <rect x="220" y="115" width="24" height="14" fill="none" stroke="#2563EB" strokeWidth="0.8" strokeOpacity="0.2" />
            
            <rect x="140" y="195" width="24" height="14" fill="none" stroke="#64748B" strokeWidth="0.8" strokeOpacity="0.18" />
            <rect x="180" y="195" width="24" height="14" fill="none" stroke="#64748B" strokeWidth="0.8" strokeOpacity="0.18" />
            <rect x="220" y="195" width="24" height="14" fill="none" stroke="#64748B" strokeWidth="0.8" strokeOpacity="0.18" />

            {/* Mining Depth & Seam Annotations */}
            <text x="88" y="94" fill="#64748B" fillOpacity="0.5" fontSize="8" fontFamily="monospace">
              LEVEL 1: -120m [HAULAGE DRIFT]
            </text>
            <text x="88" y="174" fill="#2563EB" fillOpacity="0.65" fontSize="8" fontFamily="monospace" fontWeight="600">
              LEVEL 2: -240m [SEAM III ACTIVE WORKING]
            </text>
            <text x="88" y="244" fill="#64748B" fillOpacity="0.5" fontSize="8" fontFamily="monospace">
              LEVEL 3: -360m [DEVELOPMENT SHAFT]
            </text>

            {/* Telemetry Sensor Node */}
            <circle cx="340" cy="180" r="3.5" fill="#0284C7" fillOpacity="0.7" />
            <text x="348" y="183" fill="#0284C7" fillOpacity="0.6" fontSize="7.5" fontFamily="monospace">
              VENT-S3: 4.8 m/s
            </text>
          </g>

          {/* ------------------------------------------------------------- */}
          {/* 3. TOP-RIGHT: Digital Telemetry Network & Satellite GIS       */}
          {/* ------------------------------------------------------------- */}
          <g transform="translate(1000, 40)">
            {/* Circular Telemetry Radar / GIS Polar Grid */}
            <circle cx="300" cy="120" r="110" fill="none" stroke="#2563EB" strokeWidth="0.75" strokeOpacity="0.1" />
            <circle cx="300" cy="120" r="70" fill="none" stroke="#0284C7" strokeWidth="0.75" strokeOpacity="0.12" strokeDasharray="4 4" />
            <circle cx="300" cy="120" r="30" fill="none" stroke="#38BDF8" strokeWidth="0.75" strokeOpacity="0.15" />
            <line x1="180" y1="120" x2="420" y2="120" stroke="#64748B" strokeWidth="0.7" strokeOpacity="0.12" />
            <line x1="300" y1="0" x2="300" y2="240" stroke="#64748B" strokeWidth="0.7" strokeOpacity="0.12" />

            {/* Digital Circuit Network Trace Lines */}
            <path
              d="M-40,80 L80,80 L130,130 L220,130 L260,90"
              fill="none"
              stroke="#2563EB"
              strokeWidth="1.2"
              strokeOpacity="0.25"
            />
            <path
              d="M20,180 L120,180 L170,230 L320,230"
              fill="none"
              stroke="#0284C7"
              strokeWidth="1"
              strokeOpacity="0.2"
              strokeDasharray="4 4"
            />

            {/* Network Nodes */}
            <circle cx="80" cy="80" r="3" fill="#2563EB" fillOpacity="0.6" />
            <circle cx="130" cy="130" r="2.5" fill="#0284C7" fillOpacity="0.6" />
            <circle cx="220" cy="130" r="3" fill="#2563EB" fillOpacity="0.6" />
            
            {/* Pulsing Beacon Node */}
            <circle cx="300" cy="120" r="4" fill="#2563EB" fillOpacity="0.8" />
            <circle
              cx="300"
              cy="120"
              r="14"
              fill="none"
              stroke="#2563EB"
              strokeWidth="1"
              strokeOpacity="0.4"
              className="animate-ping"
              style={{ animationDuration: '4s' }}
            />

            {/* Telemetry Labels */}
            <text x="210" y="35" fill="#475569" fillOpacity="0.55" fontSize="8.5" fontFamily="monospace" fontWeight="600">
              SURVEILLANCE RADAR // SEC-09
            </text>
            <text x="210" y="47" fill="#64748B" fillOpacity="0.45" fontSize="7.5" fontFamily="monospace">
              STATUS: REAL-TIME TELEMETRY
            </text>
            <text x="135" y="145" fill="#2563EB" fillOpacity="0.55" fontSize="7.5" fontFamily="monospace">
              NODE_CH4 #104
            </text>
          </g>

          {/* ------------------------------------------------------------- */}
          {/* 4. BOTTOM-RIGHT: Geological Strata & Safety Boundary Vector   */}
          {/* ------------------------------------------------------------- */}
          <g transform="translate(980, 530)">
            {/* Rock / Coal Silhouette Layers */}
            <path
              d="M500,370 L50,370 Q180,240 320,270 T550,220 Z"
              fill="url(#strataGradRight)"
            />
            <path
              d="M-20,290 Q160,250 300,280 T520,230"
              fill="none"
              stroke="#334155"
              strokeWidth="1.2"
              strokeOpacity="0.12"
            />
            <path
              d="M40,330 Q200,290 340,320 T540,270"
              fill="none"
              stroke="#0284C7"
              strokeWidth="0.9"
              strokeOpacity="0.1"
              strokeDasharray="6 3"
            />

            {/* Boundary Survey Polygon */}
            <polygon
              points="140,60 280,30 360,110 260,190 100,150"
              fill="#2563EB"
              fillOpacity="0.02"
              stroke="#2563EB"
              strokeWidth="1"
              strokeOpacity="0.22"
            />

            {/* Coordinates and geological marker */}
            <text x="145" y="52" fill="#475569" fillOpacity="0.55" fontSize="8" fontFamily="monospace" fontWeight="600">
              FAULT BOUNDARY F-02
            </text>
            <text x="145" y="63" fill="#64748B" fillOpacity="0.45" fontSize="7.5" fontFamily="monospace">
              STRATA: SANDSTONE / BITUMINOUS COAL
            </text>
            <text x="270" y="205" fill="#2563EB" fillOpacity="0.5" fontSize="7.5" fontFamily="monospace">
              COMPLIANCE PERIMETER 4.82 km²
            </text>

            <circle cx="280" cy="30" r="3" fill="#2563EB" fillOpacity="0.6" />
            <circle cx="260" cy="190" r="3" fill="#0284C7" fillOpacity="0.6" />
          </g>

        </g>
      </svg>

      {/* 2. Soft Ambient Radial Glow Orbs (Very faint, low opacity) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
