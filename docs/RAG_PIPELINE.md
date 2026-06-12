# RAG Pipeline — Step by Step

This document walks through the full Retrieval-Augmented Generation pipeline used by the SkyNixa Company Policy Assistant.

---

## Phase 1: Document Ingestion (Offline)

### Step 1 — Document Upload

An HR admin or employee uploads a company document via the web UI, or places files directly in `data/documents/`. Supported formats: **PDF**, **TXT**, **Markdown**.

**Code path:** `components/UploadDocument.tsx` → `POST /api/ingest` → `lib/ingestDocument.ts`

---

### Step 2 — Text Extraction

The document loader reads the file from disk and extracts plain text.

- TXT and Markdown files are read as UTF-8 text.
- PDF files are parsed with `pdf-parse` to extract text content.

**Code:** `lib/documentLoader.ts` — `loadDocumentFromFile()`

---

### Step 3 — Chunking

Long documents are split into smaller chunks (default 800 characters, 150 overlap). Each chunk keeps metadata: `source` (file name) and `fileType`.

Why chunk? Embeddings work best on focused passages, and retrieval returns only the relevant sections — not entire 20-page PDFs.

**Code:** `lib/chunkDocuments.ts` — `chunkDocuments()`, `chunkSingleDocument()`

---

### Step 4 — Embedding Generation

Each chunk is sent to Ollama's embedding model (`nomic-embed-text`). The model returns a vector (array of numbers) representing the chunk's semantic meaning.

**Code:** `lib/embeddings.ts` — `createEmbeddings()`

---

### Step 5 — Vector Storage

Chunk text, embeddings, and metadata are stored in ChromaDB at `data/chroma/`. The collection is named `skynixa-policies` by default.

**Code:** `lib/vectorStore.ts` — `addDocumentsToStore()`, `createVectorStore()`

---

## Phase 2: Question Answering (Online)

### Step 6 — User Question

An employee types a question in the chat UI, e.g. *"What is the password policy?"*

**Code:** `components/ChatBox.tsx` → `POST /api/chat`

---

### Step 7 — Query Embedding

The same Ollama embedding model converts the question into a vector using the same model used during ingestion. This ensures questions and documents live in the same vector space.

**Code:** Inside `similaritySearch()` via Chroma + Ollama embeddings

---

### Step 8 — Similarity Search

Chroma compares the question vector against all stored chunk vectors and returns the **top-K** most similar chunks (default K=4).

**Code:** `lib/vectorStore.ts` — `similaritySearch()`

---

### Step 9 — Context Retrieval

Retrieved chunks are formatted into a context block. Each chunk is labeled with its source file name so the LLM (and user) know where information came from.

Example context:
```
[Source 1: it-security-policy.md]
All SkyNixa systems require strong passwords...
```

**Code:** `lib/ragPipeline.ts` — `runRAGPipeline()`

---

### Step 10 — LLM Response Generation

The system prompt, retrieved context, and user question are sent to the local Ollama chat model (e.g. `llama3.1`). The model generates a natural-language answer grounded in the provided context.

The LLM is instructed **not to invent policies** — if context is insufficient, it says so.

**Code:** `lib/ragPipeline.ts` — `createChatModel()`, `SYSTEM_PROMPT`

---

### Step 11 — Source Citation

The API returns the answer plus a list of source documents (file names and short excerpts). The UI displays these as cards below the answer.

**Code:** `lib/ragPipeline.ts` — `buildSources()` → `components/SourceCard.tsx`

---

## End-to-End Summary

```
Upload → Extract Text → Chunk → Embed → Store in Chroma
                                              ↓
User Question → Embed → Search → Retrieve Context → LLM → Answer + Sources
```

---

## Running Ingestion

**CLI:**
```bash
npm run ingest
```

**Web UI:** Click "Re-index All Documents" after adding files to `data/documents/`.

**API:**
```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"action":"reindex-all"}'
```
