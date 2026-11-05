import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { jwtDecode } from "jwt-decode";
import InputField from "../InputField/InputField";
import Buttons from "../../utils/Buttons";
import toast from "react-hot-toast";
import { useMyContext } from "../../store/ContextApi";
import AuthLayout from "./AuthLayout";
import SocialLogin from "./SocialLogin";

const Login = () => {
  const [step, setStep] = useState(1);
  const [jwtToken, setJwtToken] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken, token } = useMyContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
      code: "",
    },
    mode: "onTouched",
  });

  const handleSuccessfulLogin = (token, decodedToken) => {
    const user = {
      username: decodedToken.sub,
      roles: decodedToken.roles ? decodedToken.roles.split(",") : [],
    };
    localStorage.setItem("JWT_TOKEN", token);
    localStorage.setItem("USER", JSON.stringify(user));

    setToken(token);

    toast.success("Login Successful");
    navigate("/notes");
  };

  const onLoginHandler = async (data) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/public/signin", data);

      reset();

      if (response.status === 200 && response.data.jwtToken) {
        setJwtToken(response.data.jwtToken);
        const decodedToken = jwtDecode(response.data.jwtToken);
        if (decodedToken.is2faEnabled) {
          setStep(2);
        } else {
          handleSuccessfulLogin(response.data.jwtToken, decodedToken);
        }
      } else {
        toast.error(
          "Login failed. Please check your credentials and try again."
        );
      }
    } catch (error) {
      if (error?.response?.data?.credentialsExpired) {
        toast.error(error.response.data.message);
        navigate("/forgot-password");
      } else {
        toast.error(error?.response?.data?.message || "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  const onVerify2FaHandler = async (data) => {
    const code = data.code;
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("code", code);
      formData.append("jwtToken", jwtToken);

      const response = await api.post("/auth/public/verify-2fa-login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const sessionToken = response.data.jwtToken;
      handleSuccessfulLogin(sessionToken, jwtDecode(sessionToken));
    } catch (error) {
      toast.error("Invalid 2FA code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (!oauthError) return;
    const messages = {
      email_unavailable:
        "We couldn't get a verified email from your account. Make your email public on GitHub or use another sign-in method.",
      account_disabled:
        "Your account has been disabled. Contact an administrator.",
      account_locked:
        "Your account is locked. Try again later or contact an administrator.",
      account_expired: "Your account has expired. Contact an administrator.",
      credentials_expired:
        "Your password has expired. Reset it using Forgot password.",
    };
    toast.error(messages[oauthError] || "Social login failed", {
      id: "oauth-error",
    });
  }, [searchParams]);

  useEffect(() => {
    const pending2faToken = location.state?.pending2faToken;
    if (!pending2faToken) return;
    setJwtToken(pending2faToken);
    setStep(2);
    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  useEffect(() => {
    if (token) navigate("/");
  }, [navigate, token]);

  if (step === 2) {
    return (
      <AuthLayout
        title="Two-factor authentication"
        subtitle="Enter the code from your authenticator app"
      >
        <form
          onSubmit={handleSubmit(onVerify2FaHandler)}
          className="space-y-4"
        >
          <InputField
            label="Verification code"
            required
            id="code"
            type="text"
            message="Code is required"
            placeholder="123456"
            register={register}
            errors={errors}
          />
          <Buttons
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Verifying..." : "Verify"}
          </Buttons>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to access your notes"
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            Sign up
          </Link>
        </>
      }
    >
      <SocialLogin />
      <form onSubmit={handleSubmit(onLoginHandler)} className="space-y-4">
        <InputField
          label="Username"
          required
          id="username"
          type="text"
          message="Username is required"
          placeholder="Your username"
          register={register}
          errors={errors}
        />
        <InputField
          label="Password"
          required
          id="password"
          type="password"
          message="Password is required"
          placeholder="Your password"
          register={register}
          errors={errors}
        />
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Forgot password?
          </Link>
        </div>
        <Buttons
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? "Logging in..." : "Log in"}
        </Buttons>
      </form>
    </AuthLayout>
  );
};

export default Login;
