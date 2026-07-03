import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "h-12", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="https://i.ibb.co/XBgjNvB/AAA.png"
        alt="Luana Santos Fotografia Logo"
        referrerPolicy="no-referrer"
        className="h-full w-auto object-contain"
      />
    </div>
  );
}
