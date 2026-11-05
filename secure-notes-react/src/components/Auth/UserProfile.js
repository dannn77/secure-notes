import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useMyContext } from "../../store/ContextApi";
import InputField from "../InputField/InputField";
import { useForm } from "react-hook-form";
import Buttons from "../../utils/Buttons";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import {
  FiKey,
  FiShield,
  FiSliders,
} from "react-icons/fi";
import Errors from "../Errors";
import Loader from "../Loader";
import Badge from "../Badge";
import SectionHeader from "../SectionHeader";
import QRCode from "qrcode";

const DISABLE_STEP = 3;

const UserProfile = () => {
  const { currentUser, token } = useMyContext();
  const [loginSession, setLoginSession] = useState(null);

  const [credentialExpireDate, setCredentialExpireDate] = useState(null);
  const [pageError, setPageError] = useState(false);

  const [accountExpired, setAccountExpired] = useState();
  const [accountLocked, setAccountLock] = useState();
  const [accountEnabled, setAccountEnabled] = useState();
  const [credentialExpired, setCredentialExpired] = useState();

  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [pageLoader, setPageLoader] = useState(false);
  const [disabledLoader, setDisabledLoader] = useState(false);
  const [twofaCodeLoader, setTwofaCodeLoader] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,

    formState: { errors },
  } = useForm({
    defaultValues: {
      username: currentUser?.username,
      email: currentUser?.email,
      currentPassword: "",
      password: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    setPageLoader(true);

    const fetch2FAStatus = async () => {
      try {
        const response = await api.get(`/auth/user/2fa-status`);
        setIs2faEnabled(response.data.is2faEnabled);
      } catch (error) {
        setPageError(error?.response?.data?.message);
        toast.error("Error fetching 2FA status");
      } finally {
        setPageLoader(false);
      }
    };
    fetch2FAStatus();
  }, []);

  const openStep = (nextStep) => {
    setCode("");
    setStep(nextStep);
  };

  const enable2FA = async () => {
    setDisabledLoader(true);
    try {
      const response = await api.post(`/auth/enable-2fa`);
      setQrCodeUrl(await QRCode.toDataURL(response.data, { margin: 1 }));
      openStep(2);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error enabling 2FA");
    } finally {
      setDisabledLoader(false);
    }
  };

  const disable2FA = async () => {
    if (!code || code.trim().length === 0)
      return toast.error("Please Enter The Code To Verify");

    setTwofaCodeLoader(true);
    try {
      const formData = new URLSearchParams();
      formData.append("code", code);

      await api.post(`/auth/disable-2fa`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      toast.success("2FA disabled");
      setIs2faEnabled(false);
      setQrCodeUrl("");
      openStep(1);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error disabling 2FA");
    } finally {
      setTwofaCodeLoader(false);
    }
  };

  const verify2FA = async () => {
    if (!code || code.trim().length === 0)
      return toast.error("Please Enter The Code To Verify");

    setTwofaCodeLoader(true);

    try {
      const formData = new URLSearchParams();
      formData.append("code", code);

      await api.post(`/auth/verify-2fa`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      toast.success("2FA verified successful");

      setIs2faEnabled(true);
      setQrCodeUrl("");
      openStep(1);
    } catch (error) {
      toast.error("Invalid 2FA Code");
    } finally {
      setTwofaCodeLoader(false);
    }
  };

  const handleChangePassword = async (data) => {
    try {
      setLoading(true);
      const formData = new URLSearchParams();
      formData.append("currentPassword", data.currentPassword);
      formData.append("newPassword", data.password);
      await api.post("/auth/update-password", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      setValue("currentPassword", "");
      setValue("password", "");
      toast.success("Password updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Password update failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      setValue("username", currentUser.username);
      setValue("email", currentUser.email);
      setAccountExpired(!currentUser.accountNonExpired);
      setAccountLock(!currentUser.accountNonLocked);
      setAccountEnabled(currentUser.enabled);
      setCredentialExpired(!currentUser.credentialsNonExpired);

      const providerNames = { google: "Google", github: "GitHub" };
      const provider = providerNames[currentUser.signUpMethod];
      const expiredFormatDate = currentUser.credentialsExpiryDate
        ? moment(currentUser.credentialsExpiryDate).format("D MMMM YYYY")
        : provider
        ? `Never (${provider} account)`
        : "Never";
      setCredentialExpireDate(expiredFormatDate);
    }
  }, [currentUser, setValue]);

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);

      const lastLoginSession = moment
        .unix(decodedToken.iat)
        .format("dddd, D MMMM YYYY, h:mm A");
      setLoginSession(lastLoginSession);
    }
  }, [token]);

  if (pageError) {
    return <Errors message={pageError} />;
  }

  const roleLabel = (currentUser?.roles?.[0] || "").replace("ROLE_", "");
  const initials = (currentUser?.username || "?").slice(0, 2).toUpperCase();

  const overview = [
    { label: "Username", value: currentUser?.username },
    { label: "Email", value: currentUser?.email },
    { label: "Role", value: roleLabel },
    { label: "Credentials expire", value: credentialExpireDate },
    {
      label: "Account expires",
      value: currentUser?.accountExpiryDate
        ? moment(currentUser.accountExpiryDate).format("D MMMM YYYY")
        : "Never",
    },
    { label: "Current session started", value: loginSession },
  ];

  const accountStatus = [
    {
      label: "Account locked",
      description:
        "Happens after 5 failed sign-in attempts and lifts on its own after 15 minutes, or is set by an administrator.",
      value: accountLocked,
      ok: !accountLocked,
    },
    {
      label: "Account expired",
      description:
        "Happens when the account reaches its expiry date. Only an administrator can extend it.",
      value: accountExpired,
      ok: !accountExpired,
    },
    {
      label: "Account enabled",
      description:
        "A disabled account can't sign in until an administrator enables it again.",
      value: accountEnabled,
      ok: accountEnabled,
    },
    {
      label: "Credentials expired",
      description:
        "Your password expires one year after you set it. Change it here or reset it using Forgot password.",
      value: credentialExpired,
      ok: !credentialExpired,
    },
  ];

  if (pageLoader) {
    return (
      <div className="min-h-[calc(100vh-64px)]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-64px)] max-w-6xl px-4 py-10 sm:px-6">
      <div className="card overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary-600 via-violet-500 to-fuchsia-500 sm:h-36" />
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <span className="-mt-12 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-slate-900 text-2xl font-semibold text-white shadow-md">
              {initials}
            </span>
            <div className="sm:pb-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {currentUser?.username}
              </h1>
              <p className="text-sm text-slate-500">{currentUser?.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:pb-1">
            {roleLabel && <Badge>{roleLabel}</Badge>}
            <Badge tone={is2faEnabled ? "green" : "gray"}>
              {is2faEnabled ? "2FA enabled" : "2FA disabled"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <aside className="card h-fit p-6">
          <h2 className="text-base font-semibold text-slate-900">Overview</h2>
          <dl className="mt-4 divide-y divide-slate-100 text-sm">
            {overview.map(({ label, value }) => (
              <div key={label} className="py-3 first:pt-0 last:pb-0">
                <dt className="text-slate-500">{label}</dt>
                <dd className="mt-0.5 break-words font-medium text-slate-900">
                  {value || "-"}
                </dd>
              </div>
            ))}
          </dl>
        </aside>

        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6">
            <SectionHeader
              icon={FiKey}
              title="Change password"
              description="Your username and email can't be changed."
            />
            <form
              className="mt-6 space-y-4"
              onSubmit={handleSubmit(handleChangePassword)}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Username"
                  required
                  id="username"
                  type="text"
                  message="Username is required"
                  placeholder="Your username"
                  register={register}
                  errors={errors}
                  readOnly
                />
                <InputField
                  label="Email"
                  required
                  id="email"
                  type="email"
                  message="Email is required"
                  placeholder="Your email"
                  register={register}
                  errors={errors}
                  readOnly
                />
              </div>
              <InputField
                label="Current password"
                required
                id="currentPassword"
                type="password"
                message="Current password is required"
                placeholder="Your current password"
                register={register}
                errors={errors}
              />
              <InputField
                label="New password"
                required
                id="password"
                type="password"
                message="New password is required"
                placeholder="At least 6 characters"
                register={register}
                errors={errors}
                min={6}
              />
              <div className="flex justify-end">
                <Buttons
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? "Saving..." : "Update password"}
                </Buttons>
              </div>
            </form>
          </section>

          <section className="card p-6">
            <SectionHeader
              icon={FiShield}
              title="Two-factor authentication"
              description="Add an extra layer of security with codes from an authenticator app."
              action={
                <Badge tone={is2faEnabled ? "green" : "gray"}>
                  {is2faEnabled ? "Active" : "Inactive"}
                </Badge>
              }
            />

            <div className="mt-6">
              <Buttons
                disabled={disabledLoader}
                onClickhandler={
                  is2faEnabled ? () => openStep(DISABLE_STEP) : enable2FA
                }
                className={
                  is2faEnabled
                    ? "btn btn-secondary text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                    : "btn btn-primary"
                }
              >
                {disabledLoader
                  ? "Loading..."
                  : is2faEnabled
                  ? "Disable two-factor authentication"
                  : "Enable two-factor authentication"}
              </Buttons>
            </div>

            {step === 2 && (
              <div className="mt-6 flex flex-col gap-6 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:flex-row">
                <img
                  src={qrCodeUrl}
                  alt="QR code for your authenticator app"
                  className="h-40 w-40 shrink-0 rounded-lg border border-slate-200 bg-white p-2"
                />
                <div className="flex-1">
                  <ol className="list-decimal space-y-1 pl-4 text-sm text-slate-600">
                    <li>Scan the QR code with your authenticator app.</li>
                    <li>Enter the code the app shows to finish the setup.</li>
                  </ol>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      placeholder="Enter 2FA code"
                      value={code}
                      required
                      className="input sm:max-w-[12rem]"
                      onChange={(e) => setCode(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={verify2FA}
                    >
                      {twofaCodeLoader ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === DISABLE_STEP && (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-600">
                  Enter the code from your authenticator app to turn off
                  two-factor authentication.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    placeholder="Enter 2FA code"
                    value={code}
                    required
                    className="input sm:max-w-[12rem]"
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <button
                    type="button"
                    disabled={twofaCodeLoader}
                    className="btn btn-danger"
                    onClick={disable2FA}
                  >
                    {twofaCodeLoader ? "Disabling..." : "Disable"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => openStep(1)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="card p-6">
            <SectionHeader
              icon={FiSliders}
              title="Account status"
              description="Managed by an administrator."
            />
            <div className="mt-2 divide-y divide-slate-100">
              {accountStatus.map(({ label, description, value, ok }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-6 py-4"
                >
                  <span>
                    <span className="block text-sm font-medium text-slate-900">
                      {label}
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-500">
                      {description}
                    </span>
                  </span>
                  <Badge tone={ok ? "green" : "rose"}>
                    {value ? "Yes" : "No"}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
