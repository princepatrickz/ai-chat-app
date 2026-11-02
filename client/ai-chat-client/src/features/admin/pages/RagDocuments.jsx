import { useDocumentHook } from "../hooks/useDocumentHook";
import { useRef } from "react";
import { formatDatetime } from "../../../utils/dateFormat";
import LoadingSpinner from "../../../components/LoadingSpinner";
import style from "../../../assets/styles/admin/documents.module.scss";
import TablePagination from "../../../components/TablePagination";
import React from "react";

export default function RagDocuments() {
  const fileInputRef = useRef(null);
  const rowsPerPage = 10;

  const {
    isSummaryLoading,
    isDocumentLoading,
    summary,
    documents,
    filteredDocuments,
    dragActive,
    error,
    selectedFiles,
    searchTerm,
    uploading,
    page,
    setPage,
    searchParam,
    totalItems,
    setSearchParam,
    fetchDocuments,
    handleFileChange,
    handleDelete,
    handleUpload,
    removeSelectedFile,
    formatSize,
    addFiles,
    setDragActive,
  } = useDocumentHook({ rowsPerPage });

  const showStatus = (chunk_count) => {
    let status = chunk_count > 0 ? "Indexed" : "Invalid Format";

    return (
      <span
        className={`${style["status-badge"]} ${style[chunk_count > 0 ? "status-indexed" : "status-failed"]}`}
      >
        <span className={style["status-dot"]}></span>
        {status || "Unknown"}
      </span>
    );
  };

  return (
    <main className={style["page"]}>
      <header className={style["page-header"]}>
        <div>
          <div className={style["eyebrow"]}>
            AI CONFIGURATION / KNOWLEDGE BASE
          </div>

          <h1 className={style["page-title"]}>RAG Documents</h1>

          <p className={style["page-description"]}>
            Manage the knowledge base used by your AI customer service
            assistant.
          </p>
        </div>

        {/* <button
          type="button"
          className={style["primary-button"]}
          onClick={() => fileInputRef.current?.click()}
        >
          <span className={style["button-icon"]}>+</span>
          Add documents
        </button> */}
      </header>

      <section className={style["stats-grid"]}>
        <article className={style["stat-card"]}>
          <div className={style["stat-top"]}>
            <span className={style["stat-label"]}>Total documents</span>
            <span className={style["stat-icon"]}>▤</span>
          </div>
          <div className={style["stat-value"]}>{summary?.total_documents}</div>
          <p className={style["stat-caption"]}>Knowledge base files</p>
        </article>

        <article className={style["stat-card"]}>
          <div className={style["stat-top"]}>
            <span className={style["stat-label"]}>Indexed documents</span>
            <span className={style["stat-icon"]}>✓</span>
          </div>
          <div className={style["stat-value"]}>{summary?.indexed_document}</div>
          <p className={style["stat-caption"]}>Ready for retrieval</p>
        </article>

        <article className={style["stat-card"]}>
          <div className={style["stat-top"]}>
            <span className={style["stat-label"]}>Total chunks</span>
            <span className={style["stat-icon"]}>▦</span>
          </div>
          <div className={style["stat-value"]}>{summary?.total_chunks}</div>
          <p className={style["stat-caption"]}>Searchable text segments</p>
        </article>
      </section>

      <section className={style["upload-card"]}>
        <div className={style["section-heading"]}>
          <div>
            <h2 className={style["section-title"]}>Upload documents</h2>
            <p className={style["section-description"]}>
              Add knowledge files for ingestion, chunking, and embedding.
            </p>
          </div>

          <span className={style["file-type-label"]}>TXT FILES</span>
        </div>

        <div
          className={`${style["dropzone"]} ${
            dragActive ? style["dropzone-active"] : ""
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragActive(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            addFiles(event.dataTransfer.files);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,text/plain"
            multiple
            hidden
            onChange={handleFileChange}
          />

          <div className={style["upload-icon"]}>
            <svg
              viewBox="0 0 24 24"
              width="30"
              height="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 16V4" />
              <path d="m7 9 5-5 5 5" />
              <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
            </svg>
          </div>

          <p className={style["dropzone-title"]}>
            Drag and drop your files here
          </p>

          <p className={style["dropzone-description"]}>
            or choose files from your computer
          </p>

          <button
            type="button"
            className={style["secondary-button"]}
            onClick={() => fileInputRef.current?.click()}
          >
            Browse files
          </button>

          <p className={style["upload-hint"]}>
            Plain text (.txt) · Multiple files supported
          </p>
        </div>

        {error && (
          <p className={style["error-message"]} role="alert">
            {error}
          </p>
        )}

        {selectedFiles.length > 0 && (
          <div className={style["selected-files"]}>
            <div className={style["selected-header"]}>
              <h3>Selected files</h3>
              <span>{selectedFiles.length} file(s)</span>
            </div>

            {selectedFiles.map((file, index) => (
              <div
                className={style["selected-file"]}
                key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
              >
                <div className={style["file-icon"]}>TXT</div>

                <div className={style["file-info"]}>
                  <span className={style["file-name"]}>{file.name}</span>
                  <span className={style["file-meta"]}>
                    {formatSize(file.size)}
                  </span>
                </div>

                <button
                  type="button"
                  className={style["remove-file-button"]}
                  onClick={() => removeSelectedFile(file)}
                  aria-label={`Remove ${file.name}`}
                >
                  ×
                </button>
              </div>
            ))}

            <div className={style["upload-actions"]}>
              <button
                type="button"
                className={style["text-button"]}
                onClick={() => setSelectedFiles([])}
                disabled={uploading}
              >
                Clear selection
              </button>

              <button
                type="button"
                className={style["primary-button"]}
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading
                  ? "Uploading..."
                  : `Upload ${selectedFiles.length} file(s)`}
              </button>
            </div>
          </div>
        )}
      </section>

      <section className={style["documents-card"]}>
        <div className={style["section-heading"]}>
          <div>
            <h2 className={style["section-title"]}>Knowledge base files</h2>
            <p className={style["section-description"]}>
              View the status and metadata of your uploaded documents.
            </p>
          </div>

          <span className={style["document-count"]}>
            {documents?.length} files
          </span>
        </div>

        <div className={style["toolbar"]}>
          <div className={style["search-box"]}>
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4 4" />
            </svg>

            <input
              type="search"
              className={style["search-input"]}
              placeholder="Search documents..."
              value={searchParam}
              onChange={(event) => setSearchParam(event.target.value)}
              aria-label="Search documents"
            />
          </div>
        </div>

        <div className={style["table-wrapper"]}>
          <table className={style["document-table"]}>
            <thead>
              <tr>
                <th>Document</th>
                {/* <th>Category</th> */}
                <th>Chunks</th>
                <th>Version</th>
                <th>Status</th>
                <th>Last updated</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {isDocumentLoading ? (
                <tr>
                  <td colSpan={6}>
                    <LoadingSpinner
                      isLoading={true}
                      showBackDrop={false}
                      centered={false}
                      size={8}
                      color={"gray"}
                    />
                  </td>
                </tr>
              ) : (
                <>
                  {filteredDocuments?.map((document) => (
                    <tr key={document.id}>
                      <td>
                        <div className={style["document-cell"]}>
                          <div className={style["document-icon"]}>
                            {document.extension}
                          </div>

                          <div className={style["document-info"]}>
                            <span className={style["document-name"]}>
                              {document.filename}
                            </span>
                            <span className={style["document-size"]}>
                              {formatSize(document.filesize)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={style["table-number"]}>
                          {document.chunk_count ?? 0}
                        </span>
                      </td>

                      <td>
                        <span className={style["version-label"]}>
                          v{document.version ?? 1}
                        </span>
                      </td>

                      <td>{showStatus(document?.chunk_count)}</td>

                      <td>
                        <span className={style["date-label"]}>
                          {formatDatetime(
                            document.updated_at ?? document.created_at,
                          )}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={style["action-button"]}
                          aria-label={`Delete ${document.fileName}`}
                          title="Delete document"
                          onClick={() => handleDelete(document)}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="17"
                            height="17"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="m19 6-1 14H6L5 6" />
                            <path d="M10 10v6M14 10v6" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredDocuments?.length === 0 && (
                    <tr>
                      <td colSpan="7">
                        <div className={style["empty-state"]}>
                          <div className={style["empty-icon"]}>▤</div>
                          <h3>No documents found</h3>
                          <p>
                            {searchTerm
                              ? "Try another search term."
                              : "Upload your first knowledge base document to get started."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className={style["table-footer"]}>
          <div className="d-flex p-4 pt-0">
            Showing {filteredDocuments?.length} of {totalItems} documents
            <div className="ms-auto">
              <TablePagination
                page={page}
                setPage={setPage}
                rowsPerPage={rowsPerPage}
                totalCount={totalItems}
                fetch={fetchDocuments}
                searchParam={searchParam}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
