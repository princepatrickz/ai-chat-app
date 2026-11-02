import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./features/home/pages/Home";
import Layout from "./layout/Layout";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./features/admin/pages/Dashboard";
import ChatSettings from "./features/admin/pages/ChatSettings";
import PageNotFound from "./routes/PageNotFound";
import { Rag } from "./features/admin/components/Rag";
import RagDocuments from "./features/admin/pages/RagDocuments";
import LoginPage from "./auth/pages/LoginPage";
import ResetPassword from "./auth/pages/ResetPassword";
import ForgotPassword from "./auth/pages/ForgotPassword";
import ProtectedRoute from "./routes/ProtectedRoute";
import ROLES from "./utils/roles";
import { AuthProvider } from "./auth/pages/AuthProvider";
import { useDispatch, useSelector } from "react-redux";
import LoadingSpinner from "./components/LoadingSpinner";
import { useLazyGetCurrentUserQuery } from "./auth/api/authApi";
import { setCredentials, clearCredentials } from "./auth/authSlice";

function App() {
  const dispatch = useDispatch();

  const { isInitialized } = useSelector((state) => state.auth);

  const [getCurrentUser, { isLoading }] = useLazyGetCurrentUserQuery();

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    const validateSession = async () => {
      try {
        const user = await getCurrentUser().unwrap();

        if (user) {
          var access_token = localStorage.getItem("access_token");

          var obj = {
            firstname: user.firstname,
            lastname: user.lastname,
            fullname: user.firstname + " " + user.lastname,
            email: user.email,
            role: user.role,
            token: access_token,
          };

          dispatch(setCredentials(obj));
        } else {
          dispatch(clearCredentials());
        }
      } catch (error) {
        console.error("Session validation failed:", error);

        dispatch(clearCredentials());
      }
    };

    validateSession();
  }, [isInitialized, getCurrentUser, dispatch]);

  if (!isInitialized) {
    return (
      <LoadingSpinner
        isLoading={isLoading}
        showBackDrop={true}
        centered={true}
        size={30}
        color="blue"
      />
    );
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/" element={<ResetPassword />} />

          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route element={<ProtectedRoute allowedRoles={[ROLES.Admin]} />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="documents" element={<RagDocuments />} />
              <Route path="knowledge">
                <Route path="documents" element={<RagDocuments />} />
              </Route>
            </Route>
          </Route>

          <Route path="/*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
