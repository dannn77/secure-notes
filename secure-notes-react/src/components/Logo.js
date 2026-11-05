import React, { useId } from "react";

const Logo = ({ className = "h-9 w-9" }) => {
  const gradientId = `logo-gradient-${useId().replace(/:/g, "")}`;

  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient
          id={gradientId}
          x1="6"
          y1="6"
          x2="26"
          y2="26"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#a5b4fc" />
          <stop offset="0.5" stopColor="#c4b5fd" />
          <stop offset="1" stopColor="#f0abfc" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="#0f172a" />
      <path
        d="M16 6c.9 5.6 4.4 9.1 10 10-5.6.9-9.1 4.4-10 10-.9-5.6-4.4-9.1-10-10 5.6-.9 9.1-4.4 10-10Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M23.5 5.5c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3Z"
        fill="#f0abfc"
      />
    </svg>
  );
};

export const Brand = ({ small = false }) => {
  return (
    <span className="flex items-center gap-2.5">
      <Logo className={small ? "h-7 w-7" : "h-9 w-9"} />
      <span
        className={`font-semibold tracking-tight text-slate-900 ${
          small ? "text-base" : "text-lg"
        }`}
      >
        Secure<span className="text-primary-600">Notes</span>
      </span>
    </span>
  );
};

export default Logo;
