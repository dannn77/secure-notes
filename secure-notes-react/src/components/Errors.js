import React from "react";
import { FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Errors = ({ message }) => {
  const navigate = useNavigate();
  const onBackHandler = () => {
    navigate(-1);
  };
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <FiAlertCircle className="text-2xl" />
      </span>
      <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
        Something went wrong
      </h2>
      {message && <p className="mt-2 max-w-md text-slate-500">{message}</p>}
      <button onClick={onBackHandler} className="btn btn-secondary mt-8">
        <FiArrowLeft /> Go back
      </button>
    </div>
  );
};

export default Errors;
