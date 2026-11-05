import React from "react";

const AuthLayout = ({ title, subtitle, children, footer }) => {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
        {footer && (
          <div className="mt-6 text-center text-sm text-slate-500">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthLayout;
