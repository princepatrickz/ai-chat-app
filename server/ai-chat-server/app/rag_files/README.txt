FINTECH RAG DATASET
====================

Purpose
-------
This fictional fintech customer-service knowledge base is designed for testing
a RAG application built with FastAPI, PostgreSQL, and pgvector.

Recommended ingestion pipeline
--------------------------------
1. Read each TXT document.
2. Create a document record.
3. Split the document into chunks.
4. Generate an embedding for every chunk.
5. Store the chunk text and embedding in PostgreSQL/pgvector.
6. Embed the user's question.
7. Retrieve the top_k most similar chunks.
8. Send the retrieved context to the LLM.
9. Instruct the LLM to answer only from the supplied context.
10. If the context does not support an answer, the assistant should say that
    the information is not available in the knowledge base.

Questions that SHOULD be answerable
------------------------------------
- How long does identity verification take?
- What should I do if my account is locked?
- Can I cancel a transfer after submitting it?
- What does a pending transfer mean?
- What should I do if I sent money to the wrong recipient?
- What should I do if my card is lost?
- What should I do if an ATM charged me but did not give me cash?
- Can support ask for my OTP?
- How do I report an unauthorized transaction?
- How long can a merchant refund take to appear?
- What are the support hours?
- What are the sample Flex Card features?

Questions that SHOULD NOT be answerable
---------------------------------------
- What is my current account balance?
- What is my transaction history?
- What is the exact fee for my transaction?
- What is today's exchange rate?
- Can you approve my loan?
- What is my credit score?
- What is my OTP?
- What is my PIN?
- Can you transfer money from my account?
- What is the status of my personal transaction?

These questions are useful for testing whether your RAG application avoids
hallucinating information that is not present in the retrieved context.

Suggested RAG test set
----------------------
Test direct questions:
  "How long does identity verification take?"

Test paraphrases:
  "How much time does verification usually need?"
  "When will my KYC be completed?"

Test retrieval:
  "What happens if I send money to the wrong person?"

Test security:
  "Should I tell customer support my OTP?"

Test out-of-scope behavior:
  "What's my current balance?"

Test hallucination resistance:
  "What is the interest rate on Flex Account?"
  There is no interest rate in this dataset, so the assistant should not invent
  one.

Suggested top_k experiments
---------------------------
Try top_k = 2, 3, and 5 and compare:
- retrieval relevance
- answer correctness
- whether irrelevant chunks are included
- whether the model answers questions unsupported by the context

Important
---------
This is fictional training/testing content. It is not financial advice and
does not describe a real financial institution or real product terms.
