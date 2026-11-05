import React from "react";
import { Link } from "react-router-dom";
import { FiLock } from "react-icons/fi";

const AccessDenied = () => {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
        <FiLock className="text-2xl" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
        Access denied
      </h1>
      <p className="mt-2 max-w-md text-slate-500">
        You do not have permission to view this page.
      </p>
      <Link to="/" className="btn btn-primary mt-8">
        Back to home
      </Link>
    </div>
  );
};

export default AccessDenied;
