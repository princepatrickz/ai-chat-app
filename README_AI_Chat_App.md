# AI Chat App

A customer-service AI chat application built with a React frontend and Python FastAPI backend. It combines retrieval-augmented generation (RAG) over an approved knowledge base with authenticated, user-scoped database tools.

## Features

- React chat interface and FastAPI API mounted under `/api`.
- Conversation creation and message handling.
- PostgreSQL persistence and pgvector semantic retrieval.
- Hybrid retrieval: vector similarity + PostgreSQL English full-text search + Reciprocal Rank Fusion (RRF, `k=60`).
- Document ingestion, chunking, embeddings, and active-document/versioning concepts.
- OpenAI Responses API integration, streaming, and function/tool calling.
- JWT authentication and password hashing using `pwdlib` / Argon2.
- Anonymous general chat; private database tools are restricted to authenticated users.
- Server-side user scoping for private transaction/account lookups.
- Redis caching and an index-version mechanism.
- Input/output validation and DeepEval evaluation.

## Technology

| Area           | Technology               |
| -------------- | ------------------------ |
| Frontend       | React                    |
| Backend        | Python, FastAPI          |
| Database       | PostgreSQL               |
| Vector search  | pgvector                 |
| Cache          | Redis                    |
| LLM            | OpenAI Responses API     |
| Embeddings     | `text-embedding-3-small` |
| Authentication | JWT, `pwdlib` / Argon2   |
| Evaluation     | DeepEval                 |

## Setup overview

Prerequisites: Python, Node.js/npm, PostgreSQL with pgvector, Redis, and an OpenAI API key.

### Backend

1. Open the backend directory and activate the project's virtual environment.
2. Install dependencies from the repository's dependency manifest.
3. Configure the environment file at the path loaded by the application.
4. Start PostgreSQL and Redis, and apply database migrations.
5. Start FastAPI using the actual ASGI module path.

Example only; confirm the module path:

```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
npm install
npm run dev
```

Configure the frontend API base URL using the project's actual environment convention.

## Configuration

Verify the exact names in the settings module and `.env.example` for:

- OpenAI API key and model
- PostgreSQL connection string
- Redis connection settings
- JWT signing secret and token configuration
- CORS allowed origins
- RAG document storage path

The implementation used `text-embedding-3-small` and a maximum output-token setting of 500; confirm current configuration before relying on these values. Never commit secrets or `.env` files.

## Known API routes

| Method | Path                                    | Purpose                                                                   |
| ------ | --------------------------------------- | ------------------------------------------------------------------------- |
| POST   | `/api/chat/start_converstation`         | Start a conversation.                                                     |
| POST   | `/api/chat/send_message`                | Submit a chat message.                                                    |
| POST   | `/api/rag/ingest-document`              | Ingest a knowledge-base document.                                         |
| DELETE | `/api/rag/delete-document/{documentId}` | Delete/deactivate a document; verify physical-file and database behavior. |

## RAG design

The pipeline uses 1,000-character chunks with 200-character overlap. It embeds chunks, performs pgvector cosine-similarity retrieval and PostgreSQL English full-text keyword retrieval, then combines rankings using RRF (`k=60`). The final generation context commonly contains the top 5 fused chunks. A question-rewriting step uses recent conversation context; the history window is the latest 10 messages.

The assistant should not invent unsupported knowledge-base answers. The configured fallback wording is:

> I don't have enough information in my knowledge base to answer that accurately.

Personal/live data requests are different from knowledge-base gaps and should be handled through authorized tools or a clear access limitation.

## Authentication and data security

- Chat may be used without a valid authenticated session.
- Missing, invalid, or expired credentials must resolve to an anonymous context for the optional chat path.
- Anonymous users must not receive private database tools.
- Every private query must be scoped server-side to the verified authenticated user's ID.
- Never trust an LLM-generated or client-supplied user ID as the authorization boundary.
- Enforce ownership checks in backend code, not only in prompts.

## Evaluation

DeepEval run dated 2026-11-01; 30 golden cases:

| Metric               |   Result | Cases |
| -------------------- | -------: | ----: |
| Faithfulness         |    1.000 |    30 |
| Answer relevancy     |    0.857 |    30 |
| Contextual precision |    0.971 |    19 |
| Contextual recall    |    0.930 |    19 |
| Latency p50          | 1,605 ms |    30 |
| Latency p95          | 4,093 ms |    30 |

Contextual metrics were scored on the 19 answerable cases. Results are dataset-specific, not proof that hallucinations or security defects are impossible. Known follow-ups include correcting the GS-026 reference answer, reviewing GS-015, improving concise/direct answers, investigating the GS-001 latency outlier, and adding abstention, prompt-injection, and cross-user isolation tests.

## Operational checklist

- Verify migrations and pgvector setup.
- Confirm Redis availability and safe cache-failure behavior.
- Ensure the document directory is writable.
- Confirm CORS and frontend API configuration.
- Review generated OpenAPI documentation.
- Run the golden evaluation suite after prompt, retrieval, validation, or tool changes.
- Track p50, p95, and maximum latency consistently.
- Test anonymous/expired-token behavior and cross-user data isolation.

## Limitiations

Infrastructure Constraints: No deployment server is available, and internal company dev/staging environments cannot be used for this project.

Current Implementation: Only two (2) tools are currently implemented:

- get_my_transactions - Retrieves detailed transaction information, including amount, date, and reference number.
- get_my_transaction_status - Retrieves the status of a customer's transaction.

## For Enchancement

For the next phase, I propose implementing the following tools:

Customer service tools

- get_payment_history - Retrieves a customer's previous transactions with pagination and date filters.
- get_payment_receipt - Retrieves an existing payment receipt or official proof of payment.
- get_payment_channels - Returns available payment channels and their instructions.
- get_payment_instructions - Explains how to complete a payment for a particular partner agency or transaction type.
- get_transaction_requirements - Explains the requirements or information needed before making a payment.

Transaction problem and troubleshooting tools

- get_payment_failure_reason - Retrieves the recorded reason for a failed transaction, if available.
- check_payment_settlement - Checks whether payment has been settled or acknowledged by the partner agency.
- get_refund_status - Retrieves the current status of a refund or reversal request.
- check_refund_eligibility - Checks whether a transaction meets the configured refund policy.
- get_reversal_status - Retrieves the status of a payment reversal, if supported by the payment provider.

## Detailed documentation

See [AI_Chat_App_Technical_Documentation.docx](AI_Chat_App_Technical_Documentation.docx).
