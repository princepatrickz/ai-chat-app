import React, { useState } from "react";
import CustomInput from "../../components/CustomInput";
import style from "../../assets/styles/auth/forgotPassword.module.scss";
import { MdMarkEmailRead } from "react-icons/md";
import { FaRegCircleUser } from "react-icons/fa6";
import { useForgotPasswordMutation } from "../api/accountApi";
import { IoWarningOutline } from "react-icons/io5";
import LoadingSpinner from "../../components/LoadingSpinner";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState("");

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const onReset = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email) {
      setHasError(true);
      setMessage("Invalid Email Address");

      return;
    }

    try {
      var result = await forgotPassword({
        email: email,
        clientUrl: "http://localhost:5173/qne",
      }).unwrap();
      var data = JSON.parse(result);

      console.log(data?.message);
      setHasError(false);
      setMessage(data?.message);
    } catch (error) {
      console.log(data?.message);
      setHasError(true);
      setMessage(error.data);
    }
  };

  return (
    <div className={style["container"]}>
      <div className={style["form"]}>
        <div className={style["form-header"]}>
          <FaRegCircleUser className={style["form-header-icon"]} />
          <h5>Forgot Password</h5>
        </div>

        <CustomInput
          type={"text"}
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />

        {isLoading ? (
          <button disabled>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <LoadingSpinner
                isLoading={true}
                showBackDrop={false}
                centered={false}
                size={17}
                color={"blue"}
              />
              <label>Loading</label>
            </div>
          </button>
        ) : (
          <button onClick={onReset}>Send password reset link</button>
        )}

        <div className={style["form-footer"]}>
          {message && (
            <div
              className={
                hasError ? style["error-container"] : style["message-container"]
              }
            >
              <div>
                {hasError ? (
                  <IoWarningOutline className={style["error-icons"]} />
                ) : (
                  <MdMarkEmailRead className={style["message-icons"]} />
                )}
              </div>
              <div
                className={
                  hasError ? style["error-message"] : style["message-message"]
                }
              >
                <label>{message}</label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
