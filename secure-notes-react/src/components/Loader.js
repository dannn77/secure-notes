import React from "react";

const Loader = ({ text = "Please wait..." }) => {
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-3 text-sm text-slate-500">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600" />
      <span>{text}</span>
    </div>
  );
};

export default Loader;
