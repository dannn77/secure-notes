const InputField = ({
  label,
  id,
  type,
  errors,
  register,
  required,
  message,
  className,
  min,
  placeholder,
  readOnly,
}) => {
  const hasError = Boolean(errors[id]?.message);

  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        id={id}
        placeholder={placeholder}
        className={`input read-only:bg-slate-50 read-only:text-slate-500 ${
          hasError
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
            : ""
        }`}
        {...register(id, {
          required: { value: required, message },
          minLength: min
            ? { value: min, message: `Minimum ${min} characters are required` }
            : null,
        })}
        readOnly={readOnly}
      />

      {hasError && (
        <p className="text-xs font-medium text-rose-600">{errors[id]?.message}</p>
      )}
    </div>
  );
};

export default InputField;
