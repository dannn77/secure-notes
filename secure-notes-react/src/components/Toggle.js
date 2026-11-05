import React from "react";

const Toggle = ({ label, description, name, checked, onChange }) => {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-6 py-4">
      <span>
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        {description && (
          <span className="mt-0.5 block text-sm text-slate-500">
            {description}
          </span>
        )}
      </span>
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          name={name}
          className="peer sr-only"
          checked={Boolean(checked)}
          onChange={onChange}
        />
        <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-primary-600 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
};

export default Toggle;
