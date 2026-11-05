import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useForm } from "react-hook-form";
import InputField from "../InputField/InputField";
import Buttons from "../../utils/Buttons";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useMyContext } from "../../store/ContextApi";
import AuthLayout from "./AuthLayout";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useMyContext();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
    mode: "onTouched",
  });

  const onPasswordForgotHandler = async (data) => {
    const { email } = data;

    try {
      setLoading(true);

      const formData = new URLSearchParams();
      formData.append("email", email);
      await api.post("/auth/public/forgot-password", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      reset();

      toast.success(
        "If an account exists for this email, we've sent a reset link. Check your inbox."
      );
    } catch (error) {
      toast.error("Error sending password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
      footer={
        <Link
          to="/login"
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          Back to login
        </Link>
      }
    >
      <form
        onSubmit={handleSubmit(onPasswordForgotHandler)}
        className="space-y-4"
      >
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
        <Buttons
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? "Sending..." : "Send reset link"}
        </Buttons>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
