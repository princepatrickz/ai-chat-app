import { createContext, useContext, useEffect, useState } from "react";
import { useLazyGetCurrentUserQuery } from "../api/authApi";
import { useDispatch } from "react-redux";
const AuthContext = createContext(null);

const API_URL = "http://localhost:8000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const [refeshSession, { isFetching }] = useLazyGetCurrentUserQuery();

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await refeshSession().unwrap();
        console.log(response);
        if (!response.ok) {
          localStorage.removeItem("access_token");
          setUser(null);

          return;
        }

        const currentUser = await response.json();
        setUser(currentUser);

        var obj = {
          firstname: currentUser.firstname,
          lastname: currentUser.lastname,
          fullname: currentUser.firstname + " " + user.lastname,
          email: currentUser.email,
          token: token,
        };

        dispatch(setCredentials(obj));
      } catch (error) {
        // A network failure is not proof that the token is invalid.
        console.error("Unable to restore authentication:", error);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  function setAuthenticatedUser(userData, accessToken) {
    localStorage.setItem("access_token", accessToken);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("access_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        setAuthenticatedUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
