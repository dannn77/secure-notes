import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { useForm } from "react-hook-form";
import InputField from "../InputField/InputField";
import toast from "react-hot-toast";
import Buttons from "../../utils/Buttons";
import AuthLayout from "./AuthLayout";

const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: "",
    },
    mode: "onTouched",
  });

  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const handleResetPassword = async (data) => {
    const { password } = data;

    const token = searchParams.get("token");

    setLoading(true);
    try {
      const formData = new URLSearchParams();

      formData.append("token", token);
      formData.append("newPassword", password);
      await api.post("/auth/public/reset-password", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      toast.success("Password reset successful! You can now log in.");
      reset();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Error resetting password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a new password for your account"
      footer={
        <Link
          to="/login"
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
        <InputField
          label="New password"
          required
          id="password"
          type="password"
          message="Password is required"
          placeholder="At least 6 characters"
          register={register}
          errors={errors}
          min={6}
        />
        <Buttons
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? "Saving..." : "Update password"}
        </Buttons>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
