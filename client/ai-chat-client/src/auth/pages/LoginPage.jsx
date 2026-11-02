import React, { useEffect, useState } from "react";
import { useLoginMutation, useLazyGetCurrentUserQuery } from "../api/authApi";
import { setCredentials } from "../authSlice";
import style from "../../assets/styles/auth/login.module.scss";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { IoWarningOutline } from "react-icons/io5";
import { FaRegCircleUser } from "react-icons/fa6";
import CustomInput from "../../components/CustomInput";
import LoadingSpinner from "../../components/LoadingSpinner";

const LoginPage = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();
  const [getUser] = useLazyGetCurrentUserQuery();
  const [errorMsg, setErrorMsg] = useState("");

  const { isAuthenticated } = useSelector((state) => state.auth);

  const onLogin = async (e) => {
    e.preventDefault();

    const returnUrl = searchParams.get("redirect") || "";

    try {
      var response = await login(form).unwrap();

      if (!response?.access_token) {
        throw new Error("Login response did not contain an access token.");
      }

      localStorage.setItem("access_token", response.access_token);

      const user = await getUser().unwrap();

      //var data = JSON.parse(response);

      var obj = {
        firstname: user.firstname,
        lastname: user.lastname,
        fullname: user.firstname + " " + user.lastname,
        email: user.email,
        role: user.role,
        token: response.access_token,
      };

      dispatch(setCredentials(obj));

      if (returnUrl) {
        navigate(decodeURIComponent(returnUrl), { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    } catch (error) {
      console.error("Login failed:", error);
      const parsedMessage =
        typeof error?.data === "string"
          ? tryParse(error.data)?.message || error.data
          : error?.data?.message || "An unexpected error occurred.";

      setErrorMsg(parsedMessage);
    }
  };

  const keyPress = (e) => {
    if (e.key === "Enter") {
      console.log(e);
    }
  };

  return (
    <>
      <div className={style["container"]}>
        <form className={style["form"]} onSubmit={onLogin}>
          <div className={style["form-header"]}>
            <FaRegCircleUser className={style["form-header-icon"]} />
            <h4>Login</h4>
          </div>

          <CustomInput
            type={"text"}
            name="email"
            placeholder="Email"
            value={form?.email}
            autoComplete="username"
            onChange={(e) => {
              setForm((curr) => ({ ...curr, email: e.target.value }));
            }}
          />

          <CustomInput
            type="password"
            name="password"
            placeholder="Password"
            value={form?.password}
            autoComplete="current-password"
            onChange={(e) => {
              setForm((curr) => ({ ...curr, password: e.target.value }));
            }}
          />

          <div className={style["controls"]}>
            <div className={style["checkbox"]}>
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">remember me?</label>
            </div>

            <a href="forgot-password">forgot password</a>
          </div>

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
                  color={"red"}
                />
                <label>Loading</label>
              </div>
            </button>
          ) : (
            <button type="submit">Sign in</button>
          )}

          <div className={style["form-footer"]}>
            {errorMsg && (
              <div className={style["error-container"]}>
                <div>
                  <IoWarningOutline className={style["error-icons"]} />
                </div>
                <div className={style["error-message"]}>
                  <label>{errorMsg}</label>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default LoginPage;
