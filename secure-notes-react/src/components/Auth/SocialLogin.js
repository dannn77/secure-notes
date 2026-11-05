import React from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const apiUrl = process.env.REACT_APP_API_URL;

const providers = [
  { id: "google", label: "Google", icon: FcGoogle },
  { id: "github", label: "GitHub", icon: FaGithub },
];

const SocialLogin = () => {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {providers.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`${apiUrl}/oauth2/authorization/${id}`}
            className="btn btn-secondary"
          >
            <Icon className="text-lg" /> {label}
          </a>
        ))}
      </div>
      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>
    </>
  );
};

export default SocialLogin;
