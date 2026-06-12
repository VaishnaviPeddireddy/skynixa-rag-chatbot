# Tech Stack — SkyNixa Company Policy Assistant

This document explains every major technology, library, and function used in the project.

---

## Next.js

**What it is:** A React framework for building full-stack web applications.

**How we use it:** Next.js powers both the frontend (home page, chat UI) and backend (API routes at `/api/chat` and `/api/ingest`). The App Router (`app/` directory) handles routing, layouts, and server-side API logic.

**Key files:** `app/page.tsx`, `app/layout.tsx`, `app/api/chat/route.ts`, `app/api/ingest/route.ts`

---

## React

**What it is:** A JavaScript library for building interactive user interfaces.

**How we use it:** React components manage chat state, file uploads, and message rendering. Client components (`"use client"`) handle user interactions; the home page is a server component that composes them.

**Key files:** `components/ChatBox.tsx`, `components/UploadDocument.tsx`, `components/SourceCard.tsx`

---

## Tailwind CSS

**What it is:** A utility-first CSS framework for rapid UI styling.

**How we use it:** All styling uses Tailwind classes — responsive layout, SkyNixa brand colors (`skynixa-*`), chat bubbles, buttons, and cards. Configured in `tailwind.config.ts`.

---

## LangChain.js

**What it is:** An open-source framework for building LLM-powered applications, especially RAG pipelines.

**How we use it:**
- `Document` objects for text chunks with metadata
- `RecursiveCharacterTextSplitter` for chunking
- `ChatOllama` for local LLM chat
- `OllamaEmbeddings` for local embeddings
- `Chroma` vector store integration

**Key files:** `lib/chunkDocuments.ts`, `lib/embeddings.ts`, `lib/vectorStore.ts`, `lib/ragPipeline.ts`

---

## Ollama

**What it is:** A free tool for running large language models locally on your machine.

**How we use it:**
- **Chat model** (`OLLAMA_MODEL`, default `llama3.1`) — generates answers from retrieved context
- **Embedding model** (`OLLAMA_EMBEDDING_MODEL`, default `nomic-embed-text`) — converts text into numerical vectors for similarity search

No API keys or cloud costs. Models are pulled once with `ollama pull <model>`.

**Key files:** `lib/embeddings.ts`, `lib/ragPipeline.ts`

---

## ChromaDB / Vector Store

**What it is:** An open-source vector database optimized for storing and searching embeddings.

**How we use it:** Document chunk embeddings are stored in `data/chroma/`. The project supports two modes:

1. **ChromaDB server** — run `npm run chroma` for a persistent Chroma instance at `http://localhost:8000`
2. **HNSWLib file store (automatic fallback)** — if Chroma is not running, embeddings are saved locally in `data/chroma/hnswlib/` with zero extra setup

Set `VECTOR_STORE_MODE=file` in `.env.local` to always use the file-based store.

**Key functions:**
- `createVectorStore()` — creates a new collection with initial chunks
- `getVectorStore()` — opens an existing collection
- `addDocumentsToStore()` — adds new chunks after upload
- `similaritySearch()` — retrieves top-K relevant chunks

**Key file:** `lib/vectorStore.ts`

---

## Embeddings

**What they are:** Numerical representations of text that capture semantic meaning. Similar texts have similar vectors.

**How we use them:** Each document chunk is embedded when ingested. User questions are embedded at query time. Chroma compares vectors to find the best matches.

**Key file:** `lib/embeddings.ts` — `createEmbeddings()` returns an `OllamaEmbeddings` instance.

---

## Chunking

**What it is:** Splitting long documents into smaller pieces so embeddings stay focused and retrieval is precise.

**How we use it:** `RecursiveCharacterTextSplitter` splits on paragraphs, then sentences, then words. Default chunk size is 800 characters with 150-character overlap so context isn't lost at boundaries.

**Key file:** `lib/chunkDocuments.ts` — `chunkDocuments()`, `chunkSingleDocument()`

---

## Retrieval

**What it is:** Finding the most relevant document chunks for a user question.

**How we use it:** `similaritySearch()` embeds the question, queries Chroma for the top-K closest chunks (default K=4), and returns them with source metadata.

**Key file:** `lib/vectorStore.ts`

---

## Prompt Template

**What it is:** A structured instruction sent to the LLM along with context and the user's question.

**How we use it:** The system prompt tells the model it is the SkyNixa Policy Assistant and must answer only from provided context. The user prompt includes retrieved chunks and the employee's question.

**Key file:** `lib/ragPipeline.ts` — `SYSTEM_PROMPT`, `buildUserPrompt()`

---

## API Routes

**What they are:** Server-side HTTP endpoints in Next.js.

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/chat` | POST | Accept question JSON, return answer + sources |
| `/api/ingest` | POST | Upload file (form-data) or re-index all docs (JSON) |

Both routes include error handling for missing Ollama, invalid input, and empty vector stores.

---

## Document Loader

**What it is:** Code that reads files and extracts plain text.

**How we use it:**
- **TXT / Markdown** — read as UTF-8 strings
- **PDF** — parsed with `pdf-parse` library

**Key functions:**
- `loadDocumentFromFile()` — load one file
- `loadAllDocuments()` — load all supported files from a directory
- `isSupportedDocument()` — validate file extension

**Key file:** `lib/documentLoader.ts`

---

## Vector Similarity Search

**What it is:** A mathematical comparison of embedding vectors to find the closest matches (cosine similarity or related metrics).

**How we use it:** When a user asks *"How many PTO days do I get?"*, the question embedding is compared against all stored chunk embeddings. Chunks from `hr-policy.txt` about PTO will rank highest and are passed to the LLM as context.

**Flow:** Question → Embed → Search Chroma → Top-K chunks → LLM → Answer

---

## Other Libraries

| Library | Purpose |
|---------|---------|
| `pdf-parse` | Extract text from PDF files |
| `chromadb` | Vector database client |
| `tsx` | Run TypeScript scripts (`npm run ingest`) |
| `dotenv` | Load `.env.local` in CLI scripts |
