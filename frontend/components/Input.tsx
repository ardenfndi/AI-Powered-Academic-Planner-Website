import { InputHTMLAttributes, forwardRef } from "react";

export default forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(props, ref){
  const { className = "", ...rest } = props;
  return <input ref={ref} className={`input ${className}`} {...rest} />;
});
