import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiActivity,
  FiArrowRight,
  FiEdit3,
  FiKey,
  FiLock,
  FiLogIn,
  FiShield,
  FiSmartphone,
} from "react-icons/fi";
import { useMyContext } from "../store/ContextApi";
import CallToAction from "./CallToAction";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const features = [
  {
    icon: FiEdit3,
    title: "Rich text editor",
    text: "Format notes with headings, lists, quotes and more, with no markup to learn.",
  },
  {
    icon: FiShield,
    title: "Two-factor authentication",
    text: "Add a second step at login with codes from any authenticator app.",
  },
  {
    icon: FiLogIn,
    title: "Sign in with Google or GitHub",
    text: "Skip yet another password and use an account you already have.",
  },
  {
    icon: FiKey,
    title: "Password recovery",
    text: "Forgot your password? Reset it through a link sent to your email.",
  },
  {
    icon: FiActivity,
    title: "Audit logs",
    text: "Every create, edit and delete is recorded, so administrators can see what changed and when.",
  },
  {
    icon: FiSmartphone,
    title: "Works everywhere",
    text: "A responsive interface that feels at home on desktop, tablet and phone.",
  },
];

const previewItems = [
  "Sketch the onboarding flow",
  "Ask the team about the launch date",
  "Book flights for the conference",
];

const LandingPage = () => {
  const { token } = useMyContext();

  const primaryCta = token
    ? { to: "/create-note", label: "Create a note" }
    : { to: "/signup", label: "Get started" };
  const secondaryCta = token
    ? { to: "/notes", label: "My notes" }
    : { to: "/login", label: "Log in" };

  return (
    <div className="min-h-[calc(100vh-64px)]">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-gradient-to-b from-primary-50 to-transparent" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <span className="eyebrow">
              <FiShield /> Two-factor authentication built in
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Your notes, <span className="text-primary-600">private</span> by
              default.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Write, organize and revisit your ideas from anywhere. SecureNotes
              protects your account with two-factor authentication and lets you
              sign in with Google or GitHub.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={primaryCta.to} className="btn btn-primary px-5 py-3">
                {primaryCta.label} <FiArrowRight />
              </Link>
              <Link
                to={secondaryCta.to}
                className="btn btn-secondary px-5 py-3"
              >
                {secondaryCta.label}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="relative hidden lg:block"
          >
            <div className="absolute -right-4 -top-4 h-full w-full rounded-2xl border border-slate-200 bg-white/60" />
            <div className="card relative p-6 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-300" />
                  <span className="h-3 w-3 rounded-full bg-amber-300" />
                  <span className="h-3 w-3 rounded-full bg-emerald-300" />
                </div>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <FiLock /> Saved
                </span>
              </div>
              <div className="space-y-4 pt-5">
                <p className="text-lg font-semibold text-slate-900">
                  Project ideas
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  {previewItems.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="space-y-2 pt-2">
                  <div className="h-2.5 w-full rounded bg-slate-100" />
                  <div className="h-2.5 w-5/6 rounded bg-slate-100" />
                  <div className="h-2.5 w-2/3 rounded bg-slate-100" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Everything you need, nothing you don't
            </h2>
            <p className="mt-3 text-slate-600">
              A focused set of tools for writing and keeping your notes safe.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <motion.div
                key={title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-xl border border-slate-200 p-6 transition hover:border-primary-200 hover:shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Icon className="text-lg" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CallToAction />
    </div>
  );
};

export default LandingPage;
