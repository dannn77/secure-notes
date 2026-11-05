import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import Buttons from "../../utils/Buttons";
import InputField from "../InputField/InputField";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useMyContext } from "../../store/ContextApi";
import AuthLayout from "./AuthLayout";
import SocialLogin from "./SocialLogin";

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const { token } = useMyContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmitHandler = async (data) => {
    const { username, email, password } = data;
    const sendData = {
      username,
      email,
      password,
    };

    try {
      setLoading(true);
      const response = await api.post("/auth/public/signup", sendData);
      toast.success("Register Successful");
      reset();
      if (response.data) {
        navigate("/login");
      }
    } catch (error) {
      if (
        error?.response?.data?.message === "Error: Username is already taken!"
      ) {
        setError("username", { message: "username is already taken" });
      } else if (
        error?.response?.data?.message === "Error: Email is already in use!"
      ) {
        setError("email", { message: "Email is already in use" });
      } else {
        toast.error(
          error?.response?.data?.message ||
            "Registration failed. Please check your details and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) navigate("/");
  }, [navigate, token]);

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start keeping your notes in one place"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            Log in
          </Link>
        </>
      }
    >
      <SocialLogin />
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        <InputField
          label="Username"
          required
          id="username"
          type="text"
          message="Username is required"
          placeholder="Choose a username"
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
        <InputField
          label="Password"
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
          {loading ? "Creating account..." : "Create account"}
        </Buttons>
      </form>
    </AuthLayout>
  );
};

export default Signup;
