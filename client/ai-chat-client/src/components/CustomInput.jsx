import React, { useRef, useState } from "react";
import style from "../assets/components/customInput.module.scss";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const CustomInput = ({ type, placeholder, errorMessage, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isUserTyped, setIsUserTyped] = useState(false);

  const onKeyPress = (e) => {
    if (type === "password")
      if (e.keyCode) {
        setIsUserTyped(true);
      }
  };

  return (
    <>
      <div className={style["input-group"]}>
        <input
          type={
            type === "password" ? (showPassword ? "text" : "password") : "text"
          }
          placeholder=" "
          style={{ borderColor: errorMessage ? "red" : "#aaa" }}
          onKeyDown={(e) => onKeyPress(e)}
          {...props}
        />
        <label>{placeholder}</label>

        {props.value && isUserTyped && (
          <button
            className="btn bg-transparent border-0 position-absolute end-0 top-50 translate-middle-y text-black fs-5"
            onClick={(e) => {
              e.preventDefault();
              setShowPassword((prev) => !prev);
            }}
          >
            {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
          </button>
        )}
      </div>

      {errorMessage && <p>* {errorMessage}</p>}
    </>
  );
};

export default CustomInput;
