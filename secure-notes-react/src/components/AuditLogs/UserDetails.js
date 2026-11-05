import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiKey, FiSliders, FiUserCheck } from "react-icons/fi";
import api from "../../services/api";
import { useForm } from "react-hook-form";
import moment from "moment";
import InputField from "../InputField/InputField";
import Buttons from "../../utils/Buttons";
import toast from "react-hot-toast";
import Errors from "../Errors";
import Loader from "../Loader";
import Badge from "../Badge";
import Toggle from "../Toggle";
import SectionHeader from "../SectionHeader";

const UserDetails = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const [loading, setLoading] = useState(false);
  const [updateRoleLoader, setUpdateRoleLoader] = useState(false);
  const [passwordLoader, setPasswordLoader] = useState(false);

  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState(null);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryDateLoader, setExpiryDateLoader] = useState(false);

  const fetchUserDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/user/${userId}`);
      setUser(response.data);

      setSelectedRole(response.data.role?.roleName || "");
    } catch (err) {
      setError(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      setValue("username", user.userName);
      setValue("email", user.email);
      setExpiryDate(user.accountExpiryDate || "");
    }
  }, [user, setValue]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await api.get("/admin/roles");
      setRoles(response.data);
    } catch (err) {
      setError(err?.response?.data?.message);
    }
  }, []);

  useEffect(() => {
    fetchUserDetails();
    fetchRoles();
  }, [fetchUserDetails, fetchRoles]);

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleUpdateRole = async () => {
    setUpdateRoleLoader(true);
    try {
      const formData = new URLSearchParams();
      formData.append("userId", userId);
      formData.append("roleName", selectedRole);

      await api.put(`/admin/update-role`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      fetchUserDetails();
      toast.success("Update role successful");
    } catch (err) {
      toast.error("Update Role Failed");
    } finally {
      setUpdateRoleLoader(false);
    }
  };

  const handleSavePassword = async (data) => {
    setPasswordLoader(true);
    const newPassword = data.password;

    try {
      const formData = new URLSearchParams();
      formData.append("userId", userId);
      formData.append("password", newPassword);

      await api.put(`/admin/update-password`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      setIsEditingPassword(false);
      setValue("password", "");
      toast.success("password update success");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          (typeof err?.response?.data === "string" ? err.response.data : "") ||
          "Error updating password"
      );
    } finally {
      setPasswordLoader(false);
    }
  };

  const handleCheckboxChange = async (e, { url, param, successMessage }) => {
    try {
      const formData = new URLSearchParams();
      formData.append("userId", userId);
      formData.append(param, e.target.checked);

      await api.put(url, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      fetchUserDetails();
      toast.success(successMessage);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error updating account status");
    }
  };

  const handleSaveExpiryDate = async (date) => {
    setExpiryDateLoader(true);
    try {
      const formData = new URLSearchParams();
      formData.append("userId", userId);
      if (date) formData.append("expiryDate", date);

      await api.put("/admin/update-expiry-date", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      fetchUserDetails();
      toast.success(date ? "Account expiry date updated" : "Account expiry date removed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error updating expiry date");
    } finally {
      setExpiryDateLoader(false);
    }
  };

  if (error) {
    return <Errors message={error} />;
  }

  const isPastDate = (date) => !!date && moment(date).isBefore(moment(), "day");
  const formatDate = (date) => moment(date).format("D MMMM YYYY");

  const credentialsExpired =
    !user?.credentialsNonExpired || isPastDate(user?.credentialsExpiryDate);
  const accountExpired =
    !user?.accountNonExpired || isPastDate(user?.accountExpiryDate);

  const lockDescription = user?.lockedUntil
    ? `Locked automatically after too many failed sign-in attempts. Unlocks on its own at ${moment(
        user.lockedUntil
      ).format("HH:mm")}.`
    : "Locks automatically for 15 minutes after 5 failed sign-in attempts. A lock set here stays until you remove it.";

  const statusToggles = [
    {
      name: "lock",
      label: "Account locked",
      description: lockDescription,
      checked: !user?.accountNonLocked,
      url: "/admin/update-lock-status",
      param: "lock",
      successMessage: "Account lock status updated",
    },
    {
      name: "expire",
      label: "Account expired",
      description:
        "Expired accounts can't sign in. Use it for temporary accounts, together with the expiry date below.",
      checked: accountExpired,
      url: "/admin/update-expiry-status",
      param: "expire",
      successMessage: "Account expiry status updated",
    },
    {
      name: "enabled",
      label: "Account enabled",
      description:
        "Turn off to deactivate the account. It stays off until an administrator turns it back on.",
      checked: user?.enabled,
      url: "/admin/update-enabled-status",
      param: "enabled",
      successMessage: "Account enabled status updated",
    },
    {
      name: "credentialsExpire",
      label: "Credentials expired",
      description: `The user must reset their password before signing in. ${
        user?.credentialsExpiryDate
          ? `The password expires on ${formatDate(user.credentialsExpiryDate)}.`
          : "The password never expires."
      }`,
      checked: credentialsExpired,
      url: "/admin/update-credentials-expiry-status",
      param: "expire",
      successMessage: "Credentials expiry status updated",
    },
  ];

  return (
    <div>
      <Link
        to="/admin/users"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <FiArrowLeft /> All users
      </Link>

      {loading && !user ? (
        <Loader />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white">
              {user?.userName?.slice(0, 2).toUpperCase()}
            </span>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {user?.userName}
              </h1>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
            <div className="flex gap-2">
              {selectedRole && (
                <Badge>{selectedRole.replace("ROLE_", "")}</Badge>
              )}
              <Badge tone={user?.enabled ? "green" : "gray"}>
                {user?.enabled ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="card p-6">
              <SectionHeader
                icon={FiKey}
                title="Profile information"
                description="Account details and password."
              />
              <form
                className="mt-6 space-y-4"
                onSubmit={handleSubmit(handleSavePassword)}
              >
                <InputField
                  label="Username"
                  required
                  id="username"
                  type="text"
                  message="Username is required"
                  placeholder="Username"
                  register={register}
                  errors={errors}
                  readOnly
                />
                <InputField
                  label="Email"
                  required
                  id="email"
                  type="text"
                  message="Email is required"
                  placeholder="Email"
                  register={register}
                  errors={errors}
                  readOnly
                />
                <InputField
                  label="Password"
                  required
                  id="password"
                  type="password"
                  message="Password is required"
                  placeholder={
                    isEditingPassword ? "New password" : "••••••••"
                  }
                  register={register}
                  errors={errors}
                  readOnly={!isEditingPassword}
                  min={6}
                />
                <div className="flex justify-end gap-2">
                  {!isEditingPassword ? (
                    <Buttons
                      onClickhandler={() => setIsEditingPassword(true)}
                      className="btn btn-secondary"
                    >
                      Change password
                    </Buttons>
                  ) : (
                    <>
                      <Buttons
                        onClickhandler={() => setIsEditingPassword(false)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </Buttons>
                      <Buttons
                        type="submit"
                        disabled={passwordLoader}
                        className="btn btn-primary"
                      >
                        {passwordLoader ? "Saving..." : "Save password"}
                      </Buttons>
                    </>
                  )}
                </div>
              </form>
            </section>

            <section className="card h-fit p-6">
              <SectionHeader
                icon={FiUserCheck}
                title="Role"
                description="Controls what this user can access."
              />
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <select
                  className="input uppercase"
                  value={selectedRole}
                  onChange={handleRoleChange}
                >
                  {roles.map((role) => (
                    <option key={role.roleId} value={role.roleName}>
                      {role.roleName}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={updateRoleLoader}
                  className="btn btn-primary shrink-0"
                  onClick={handleUpdateRole}
                >
                  {updateRoleLoader ? "Saving..." : "Update role"}
                </button>
              </div>
            </section>

            <section className="card p-6 lg:col-span-2">
              <SectionHeader
                icon={FiSliders}
                title="Account status"
                description="Lock, expire or disable this account."
              />
              <div className="mt-2 divide-y divide-slate-100">
                {statusToggles.map(
                  ({ url, param, successMessage, ...toggle }) => (
                    <Toggle
                      key={toggle.name}
                      {...toggle}
                      onChange={(e) =>
                        handleCheckboxChange(e, { url, param, successMessage })
                      }
                    />
                  )
                )}
                <div className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <span>
                    <span className="block text-sm font-medium text-slate-900">
                      Account expiry date
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-500">
                      {user?.accountExpiryDate
                        ? `The account expires on ${formatDate(
                            user.accountExpiryDate
                          )}.`
                        : "The account never expires."}
                    </span>
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="input w-auto"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={expiryDateLoader}
                      className="btn btn-primary shrink-0"
                      onClick={() => handleSaveExpiryDate(expiryDate)}
                    >
                      Save
                    </button>
                    {user?.accountExpiryDate && (
                      <button
                        type="button"
                        disabled={expiryDateLoader}
                        className="btn btn-secondary shrink-0"
                        onClick={() => handleSaveExpiryDate("")}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDetails;
