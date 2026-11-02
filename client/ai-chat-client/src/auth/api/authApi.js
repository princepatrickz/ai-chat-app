import { apiSlice } from "../../app/api/apiSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (payload) => ({
        url: "auth/login",
        method: "POST",
        body: payload,
      }),
    }),
    getCurrentUser: builder.query({
      query: () => "auth/me",
    }),
  }),
});

export const { useLoginMutation, useLazyGetCurrentUserQuery } = authApi;
