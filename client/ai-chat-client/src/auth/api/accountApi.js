import { apiSlice } from "../../app/api/apiSlice";

export const accountSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (payload) => ({
        url: "/Account/login",
        method: "POST",
        body: payload,
        responseHandler: (response) => response.text(),
      }),
    }),
    validateToken: builder.mutation({
      query: (payload) => ({
        url: "/Account/validate-session",
        method: "GET",
        responseHandler: (response) => response.text(),
      }),
    }),
    refreshToken: builder.mutation({
      query: (payload) => ({
        url: "/Account/refresh",
        method: "GET",
        responseHandler: (response) => response.text(),
      }),
    }),
    logout: builder.mutation({
      query: (payload) => ({
        url: "/Account/logout",
        method: "POST",
        responseHandler: (response) => response.text(),
      }),
    }),
    forgotPassword: builder.mutation({
      query: (payload) => ({
        url: "/Account/forgot-password",
        method: "POST",
        body: payload,
        responseHandler: (response) => response.text(),
      }),
    }),
    validateResetToken: builder.mutation({
      query: (payload) => ({
        url: "/Account/validate-reset-token",
        method: "POST",
        body: payload,
        responseHandler: (response) => response.text(),
      }),
    }),
    passwordReset: builder.mutation({
      query: (payload) => ({
        url: "/Account/reset-password",
        method: "POST",
        body: payload,
        responseHandler: (response) => response.text(),
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useValidateTokenMutation,
  userRefreshTokenMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useValidateResetTokenMutation,
  usePasswordResetMutation,
} = accountSlice;
