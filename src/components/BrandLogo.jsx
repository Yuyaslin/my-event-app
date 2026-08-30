import React from "react";

export default function BrandLogo({ className = "", size = "normal" }) {
  const isSmall = size === "small";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 3D Isometric Cube in Cyan-Blue Gradient Squircle */}
      <div className="relative shrink-0 shadow-md shadow-sky-500/20 transition-transform hover:scale-105 duration-200">
        <svg
          viewBox="0 0 44 44"
          className={isSmall ? "w-8 h-8" : "w-10 h-10"}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="eventOpsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          {/* Rounded Squircle Container */}
          <rect width="44" height="44" rx="12" fill="url(#eventOpsGrad)" />
          
          {/* 3D Isometric Cube */}
          <g stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            {/* Outer Hexagon of Cube */}
            <path d="M22 10L32 15.8V27.4L22 33.2L12 27.4V15.8L22 10Z" />
            {/* Inner Y-Shape of Cube */}
            <path d="M22 21.6V33.2" />
            <path d="M22 21.6L32 15.8" />
            <path d="M22 21.6L12 15.8" />
          </g>
        </svg>
      </div>

      {/* Brand Text */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-100 text-base sm:text-lg tracking-widest leading-none">
            EventOps AI
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-sans">
          <span className="font-medium text-slate-300">智慧活動管理助手</span>
          <span>•</span>
          <span className="text-slate-400">執行團隊的第二大腦</span>
        </div>
      </div>
    </div>
  );
}
