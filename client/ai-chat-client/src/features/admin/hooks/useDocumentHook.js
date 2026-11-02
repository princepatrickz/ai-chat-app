import react, { useEffect, useState } from "react";
import {
  useGetSummaryQuery,
  useLazyGetDocumentsQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
} from "../api/adminApi";

export const useDocumentHook = ({ initialDocuments, rowsPerPage }) => {
  const {
    data: summary,
    isFetching: isSummaryLoading,
    refetch: refetchSummary,
  } = useGetSummaryQuery();

  const [fetchDocuments, { data: documents, isFetching: isDocumentLoading }] =
    useLazyGetDocumentsQuery();

  const [uploadFile, { isLoading: uploading }] = useUploadDocumentMutation();
  const [deleteFile, { isLoading: deleting }] = useDeleteDocumentMutation();
  const [searchParam, setSearchParam] = useState("");
  const [page, setPage] = useState(1);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filteredDocuments, setFilteredDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments({ page: page, size: rowsPerPage, searchParam: "" });
  }, []);

  useEffect(() => {
    fetchDocuments({ page: page, size: rowsPerPage, searchParam: searchParam });
  }, [searchParam]);

  useEffect(() => {
    setFilteredDocuments(documents?.items);
    setTotalItems(documents?.total);
    setTotalPages(documents?.total_pages);
  }, [documents]);

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    setError("");

    if (!files.length) return;

    const invalidFiles = files.filter(
      (file) => !file.name.toLowerCase().endsWith(".txt"),
    );

    if (invalidFiles.length) {
      setError("Only .txt files are supported.");
      return;
    }

    setSelectedFiles((previous) => {
      const combined = [...previous];

      files.forEach((file) => {
        if (
          !combined.some(
            (existing) =>
              existing.name === file.name &&
              existing.size === file.size &&
              existing.lastModified === file.lastModified,
          )
        ) {
          combined.push(file);
        }
      });

      return combined;
    });
  };

  const handleFileChange = (event) => {
    addFiles(event.target.files);
    event.target.value = "";
  };

  const removeSelectedFile = (fileToRemove) => {
    setSelectedFiles((previous) =>
      previous.filter((file) => file !== fileToRemove),
    );
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    //setError("");

    try {
      const formData = new FormData();

      for (const file of selectedFiles) {
        formData.append("file", file);
      }

      await uploadFile(formData);

      setSelectedFiles([]);
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      refetchSummary();

      fetchDocuments({ page: page, size: rowsPerPage, searchParam: "" });
    }
  };

  const handleDelete = async (document) => {
    try {
      await deleteFile(document.id);

      refetchSummary();

      fetchDocuments({ page: page, size: rowsPerPage, searchParam: "" });
    } catch (err) {
      console.log(err);
    }
  };

  const getExtension = (fileName) =>
    fileName.split(".").pop()?.toUpperCase() || "FILE";

  return {
    isSummaryLoading,
    isDocumentLoading,
    summary,
    documents,
    filteredDocuments,
    dragActive,
    error,
    selectedFiles,
    uploading,
    page,
    setPage,
    searchParam,
    totalItems,
    totalPages,
    setSearchParam,
    fetchDocuments,
    handleFileChange,
    getExtension,
    handleDelete,
    handleUpload,
    removeSelectedFile,
    formatSize,
    addFiles,
    setDragActive,
  };
};
