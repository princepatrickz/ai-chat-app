import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import style from "../../assets/styles/auth/forgotPassword.module.scss";
import { FaRegCircleUser } from "react-icons/fa6";
import CustomInput from "../../components/CustomInput";
import { FaCheckCircle } from "react-icons/fa";
import { IoWarningOutline } from "react-icons/io5";
import {
  useValidateResetTokenMutation,
  usePasswordResetMutation,
} from "../api/accountApi";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ email: "", token: "", password: "" });
  const [hasError, setHasError] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLinkExpired, setLinkExpired] = useState(false);

  const [passwordReset, { isLoading }] = usePasswordResetMutation();
  const [validateToken, { isLinkLoading }] = useValidateResetTokenMutation();
  const navigate = useNavigate();

  useEffect(() => {
    validateLink();
  }, []);

  const validateLink = async () => {
    try {
      const email = searchParams.get("email");
      const token = searchParams.get("token");

      var result = await validateToken({
        email: email,
        token: token,
        password: newPassword,
        confirmPassword: confirmPassword,
      }).unwrap();

      setLinkExpired(false);
    } catch (error) {
      var result = JSON.parse(error.data);

      setLinkExpired(true);
      setMessage(result?.message);
    }
  };

  const onReset = async (e) => {
    e.preventDefault();

    try {
      const email = searchParams.get("email");
      const token = searchParams.get("token");

      var result = await passwordReset({
        email: email,
        token: token,
        password: newPassword,
        confirmPassword: confirmPassword,
      }).unwrap();
      var data = JSON.parse(result);

      setNewPassword("");
      setConfirmPassword("");
      setMessage(data.message);
      setHasError(false);
      // console.log(data.message);
    } catch (error) {
      console.log(error);
      var data = JSON.parse(error.data);

      setMessage(data.message);
      setHasError(true);
    }
  };

  return (
    <div className={style["container"]}>
      <div className={style["form"]}>
        <>
          <div className={style["form-header"]}>
            <FaRegCircleUser className={style["form-header-icon"]} />
            <h5>Reset Password</h5>
          </div>

          {isLinkExpired ? (
            <>
              <div className={style["form-footer"]}>
                <div className={style["error-container"]}>
                  <div>
                    <IoWarningOutline className={style["error-icons"]} />
                  </div>
                  <div
                    className={style["error-message"]}
                    style={{
                      whiteSpace: "pre-line",
                      width: "100%",
                    }}
                  >
                    <label>{message}</label>
                  </div>
                </div>

                <a href="/qne/login" style={{ marginTop: "50px" }}>
                  back to login page
                </a>
              </div>
            </>
          ) : (
            <>
              <CustomInput
                type={"password"}
                name="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <CustomInput
                type={"password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                <button onClick={onReset}>Reset password</button>
              )}

              <div className={style["form-footer"]}>
                {message && (
                  <div
                    className={
                      hasError
                        ? style["error-container"]
                        : style["message-container"]
                    }
                  >
                    <div>
                      {hasError ? (
                        <IoWarningOutline className={style["error-icons"]} />
                      ) : (
                        <FaCheckCircle className={style["message-icons"]} />
                      )}
                    </div>
                    <div
                      className={
                        hasError
                          ? style["error-message"]
                          : style["message-message"]
                      }
                    >
                      <label style={{ whiteSpace: "pre-line" }}>
                        {message}
                      </label>
                    </div>
                  </div>
                )}
                <a href="/qne/login">back to login page</a>
              </div>
            </>
          )}
        </>
      </div>
    </div>
  );
};

export default ResetPassword;
