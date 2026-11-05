import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiAlertCircle, FiHelpCircle, FiMessageSquare } from "react-icons/fi";
import api from "../../services/api";
import Buttons from "../../utils/Buttons";
import InputField from "../InputField/InputField";

const topics = [
  {
    icon: FiHelpCircle,
    title: "Account questions",
    text: "Trouble signing in or setting up two-factor authentication.",
  },
  {
    icon: FiMessageSquare,
    title: "Feedback and ideas",
    text: "Tell us what would make SecureNotes better for you.",
  },
  {
    icon: FiAlertCircle,
    title: "Report a problem",
    text: "Found a bug? Let us know what happened and we will look into it.",
  },
];

const ContactPage = () => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
    mode: "onTouched",
  });

  const onSubmitHandler = async (data) => {
    setLoading(true);
    try {
      await api.post("/contact", data);
      toast.success("Thanks! Your message has been sent.");
      reset();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "We couldn't send your message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-primary-50 to-transparent" />

      <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
        <div className="lg:pt-6">
          <span className="eyebrow">Contact</span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Let's talk
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-600">
            We'd love to hear from you. If you have any questions or feedback,
            send us a message.
          </p>

          <ul className="mt-10 space-y-6">
            {topics.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary-600 shadow-sm ring-1 ring-slate-200">
                  <Icon className="text-lg" />
                </span>
                <div>
                  <p className="font-medium text-slate-900">{title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={handleSubmit(onSubmitHandler)}
          className="card space-y-5 p-6 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              label="Name"
              required
              id="name"
              type="text"
              message="Name is required"
              placeholder="Your name"
              register={register}
              errors={errors}
            />
            <InputField
              label="Email"
              required
              id="email"
              type="email"
              message="Email is required"
              placeholder="you@example.com"
              register={register}
              errors={errors}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-sm font-medium text-slate-700">
              Message
            </label>
            <textarea
              id="message"
              rows={6}
              placeholder="How can we help?"
              className={`input resize-none ${
                errors.message
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                  : ""
              }`}
              {...register("message", {
                required: "Message is required",
                maxLength: {
                  value: 5000,
                  message: "Message can be at most 5000 characters",
                },
              })}
            ></textarea>
            {errors.message && (
              <p className="text-xs font-medium text-rose-600">
                {errors.message.message}
              </p>
            )}
          </div>
          <Buttons
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Sending..." : "Send message"}
          </Buttons>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
