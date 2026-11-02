import { apiSlice } from "../../app/api/apiSlice";

const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    startConversation: builder.mutation({
      query: () => ({
        url: "/chat/start_converstation",
        method: "POST",
      }),
    }),
    sendMessage: builder.mutation({
      query: (payload) => ({
        url: "/chat/send_message",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const { useStartConversationMutation, useSendMessageMutation } = chatApi;
