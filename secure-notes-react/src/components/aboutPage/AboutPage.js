import React from "react";
import { motion } from "framer-motion";
import { FiCheck, FiCloud, FiFeather, FiLock } from "react-icons/fi";
import CallToAction from "../CallToAction";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const highlights = [
  "Two-factor authentication for every account",
  "Sign in with Google or GitHub",
  "Every change recorded in audit logs",
  "Password recovery by email",
];

const values = [
  {
    icon: FiLock,
    title: "Privacy first",
    text: "Your notes belong to your account alone, and two-factor authentication keeps it that way.",
  },
  {
    icon: FiFeather,
    title: "Simple by design",
    text: "No clutter and no learning curve, just a clean editor that gets out of your way.",
  },
  {
    icon: FiCloud,
    title: "Always within reach",
    text: "Sign in from any browser, on any device, and pick up right where you left off.",
  },
];

const steps = [
  {
    title: "Create an account",
    text: "Sign up with your email in a few seconds, or continue with Google or GitHub.",
  },
  {
    title: "Secure it",
    text: "Turn on two-factor authentication from your profile page.",
  },
  {
    title: "Start writing",
    text: "Capture ideas, plans and to-dos with the rich text editor.",
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-[calc(100vh-64px)]">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-primary-50 to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-24 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-200/40 blur-3xl" />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 sm:py-32"
        >
          <span className="eyebrow">About us</span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            A calm, secure home for your{" "}
            <span className="text-primary-600">thoughts</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            SecureNotes is a note-taking app built around one simple idea: what
            you write should stay yours. We pair a distraction-free editor with
            strong account security, so you can focus on your ideas instead of
            worrying about them.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-24 sm:px-6 lg:grid-cols-2">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Our mission
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            Notes are where we keep the things that matter: plans, drafts,
            reminders and ideas we are not ready to share yet. We think they
            deserve more care than a sticky note on a shared screen.
          </p>
          <p className="mt-4 leading-relaxed text-slate-600">
            That is why SecureNotes puts security first without making it
            complicated. The protection is there when you need it, and out of
            the way when you just want to write.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="card p-8"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
            What you get
          </p>
          <ul className="mt-6 space-y-4">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                  <FiCheck className="text-sm" />
                </span>
                <span className="text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              What we value
            </h2>
            <p className="mt-3 text-slate-600">
              Three principles guide every decision we make.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <motion.div
                key={title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-2xl border border-slate-200 p-8 text-center transition hover:border-primary-200 hover:shadow-sm"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon className="text-xl" />
                </span>
                <h3 className="mt-5 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Get started in three steps
          </h2>
        </div>
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map(({ title, text }, index) => (
            <li key={title} className="card p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <CallToAction />
    </div>
  );
};

export default AboutPage;
