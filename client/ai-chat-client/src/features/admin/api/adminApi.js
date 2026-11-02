import { apiSlice } from "../../../app/api/apiSlice";

const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSummary: builder.query({
      query: () => "/rag/summary",
    }),
    getDocuments: builder.query({
      query: ({ page, size, searchParam }) => {
        return `/rag/documents?page=${page}&page_size=${size}&search_param=${searchParam}`;
      },
    }),
    uploadDocument: builder.mutation({
      query: (formData) => {
        return {
          url: "/rag/ingest-document",
          method: "POST",
          body: formData,
        };
      },
    }),
    deleteDocument: builder.mutation({
      //data = { id: documentId}

      query: (documentId) => {
        return {
          url: `/rag/delete-document/${documentId}`,
          method: "DELETE",
        };
      },
    }),
  }),
});

export const {
  useGetSummaryQuery,
  useLazyGetDocumentsQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
} = adminApi;
