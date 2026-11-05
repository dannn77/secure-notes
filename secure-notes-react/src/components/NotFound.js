import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="text-center">
        <p className="text-sm font-semibold text-primary-600">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 text-slate-500">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link to="/" className="btn btn-primary mt-8">
          Back to home
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
