import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useMyContext } from "../store/ContextApi";

const CallToAction = () => {
  const { token } = useMyContext();

  const cta = token
    ? { to: "/create-note", label: "Create a note" }
    : { to: "/signup", label: "Get started" };

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-14 text-center sm:px-12">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary-600/40 blur-3xl" />
        <h2 className="relative text-2xl font-bold text-white sm:text-3xl">
          {token ? "Got something on your mind?" : "Start writing in seconds"}
        </h2>
        <p className="relative mx-auto mt-3 max-w-lg text-slate-300">
          {token
            ? "Capture it before it slips away."
            : "Create an account and write your first note today."}
        </p>
        <Link
          to={cta.to}
          className="btn btn-primary relative mt-8 px-5 py-3"
        >
          {cta.label} <FiArrowRight />
        </Link>
      </div>
    </section>
  );
};

export default CallToAction;
