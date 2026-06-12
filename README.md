# SkyNixa Company Policy Assistant

A **Retrieval-Augmented Generation (RAG)** chatbot that helps SkyNixa employees ask natural-language questions about company policies, HR rules, IT security, onboarding steps, benefits, and internal documents.

Built with **100% free and open-source tools** — no paid API keys required.

**Default mode: Lightweight RAG** — runs on limited RAM with **no Ollama** needed. Optional Ollama mode for full local LLM answers.

---

## Problem Statement

Employees waste time searching through PDFs, wikis, and email threads to find answers about PTO, remote work rules, password policies, and benefits. Information is scattered, outdated copies circulate, and HR/IT teams answer the same questions repeatedly.

## Real-World Use Case

SkyNixa (a fictional company) has HR handbooks, IT security policies, onboarding guides, and benefits documents. New hires and existing employees can open this chatbot, ask a question in plain English, and get an **accurate answer grounded in official documents** — with **source citations** showing which file the answer came from.

---

## Features

- Clean chat UI built with Next.js and Tailwind CSS
- Upload company documents (PDF, TXT, Markdown)
- Documents stored in `/data/documents`
- Automatic text chunking for better retrieval
- **Lightweight mode** — tiny Hugging Face embeddings (~17 MB), no Ollama, no C++ build tools
- Vector storage with a simple JSON index (low RAM, works on any Windows/Mac/Linux)
- RAG pipeline powered by LangChain.js
- Optional Ollama mode for full LLM-generated answers (phi3, gemma2:2b)
- Source document citations on every answer
- Simple error handling for missing Ollama, empty index, and bad uploads
- Sample SkyNixa policy documents included

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS |
| Backend | Next.js API Routes |
| RAG Framework | LangChain.js |
| Vector DB | JSON file index (pure JavaScript, no native deps) |
| Embeddings | Hugging Face `paraphrase-MiniLM-L3-v2` (~17 MB) |
| LLM | Ollama (`llama3.1` by default) |
| Documents | PDF, TXT, Markdown |

See [docs/TECH_STACK.md](docs/TECH_STACK.md) for detailed explanations.

---

## How RAG Works in This Project

1. **Ingest:** Company documents are loaded, split into chunks, embedded, and stored in ChromaDB.
2. **Ask:** Employee types a question in the chat UI.
3. **Retrieve:** The question is embedded and compared against stored chunks (similarity search).
4. **Generate:** Top relevant chunks are sent as context to the local Ollama LLM.
5. **Answer:** The LLM produces a grounded response with source file names.

See [docs/RAG_PIPELINE.md](docs/RAG_PIPELINE.md) and [docs/RAG_PIPELINE_DIAGRAM.md](docs/RAG_PIPELINE_DIAGRAM.md).

---

## Setup Instructions

### Prerequisites

- **Node.js** 18+ and **npm**
- **Ollama is optional** — only needed if you set `AI_PROVIDER=ollama`

### Quick start (no Ollama — recommended for portfolio / low RAM)

```bash
cd skynixa-rag-chatbot
npm install
copy .env.example .env.local
npm run ingest
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). First ingest downloads a tiny embedding model (~17 MB) automatically.

No Docker, Chroma server, Visual Studio, or Ollama required for the default setup.

### 1. Clone and install

```bash
git clone <your-repo-url>
cd skynixa-rag-chatbot
npm install
```

### 2. Configure environment

```bash
copy .env.example .env.local
```

Default `.env.local` uses `AI_PROVIDER=lightweight` — no Ollama required.

### 3. Index sample documents

```bash
npm run ingest
```

Or click **"Re-index All Documents"** in the web UI after starting the dev server.

Embeddings and the search index are saved in `data/chroma/index.json`.

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Lightweight vs Ollama Mode

| | Lightweight (default) | Ollama |
|--|---------------------|--------|
| RAM needed | ~2 GB | 8–16 GB |
| Extra installs | None | Ollama + models |
| Embeddings | Hugging Face `paraphrase-MiniLM-L3-v2` (~17 MB) | `nomic-embed-text` |
| Answers | Retrieved from documents | LLM-generated |
| Best for | Low-RAM laptops, quick demo | Production-like local AI |

Set in `.env.local`:
```env
AI_PROVIDER=lightweight   # no Ollama
# AI_PROVIDER=ollama        # full local LLM
```

---

## How to Run Ollama Locally (optional)

### Install Ollama

Download from [https://ollama.com/download](https://ollama.com/download) and install for your OS.

### Start the Ollama server

Ollama usually runs automatically after install. Verify with:

```bash
ollama list
```

### Pull required models

```bash
# Chat model (pick one)
ollama pull llama3.1
# ollama pull mistral
# ollama pull phi3

# Embedding model (required)
ollama pull nomic-embed-text
```

### Test Ollama

```bash
ollama run llama3.1 "Hello, SkyNixa!"
```

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API URL |
| `OLLAMA_MODEL` | `llama3.1` | Chat model name |
| `OLLAMA_EMBEDDING_MODEL` | `nomic-embed-text` | Embedding model |
| `RAG_TOP_K` | `4` | Chunks retrieved per question |
| `CHUNK_SIZE` | `800` | Characters per chunk |
| `CHUNK_OVERLAP` | `150` | Overlap between chunks |

---

## How to Upload Documents

### Via the web UI

1. Open the app at `http://localhost:3000`
2. Use **"Choose File"** in the Upload Documents panel
3. Select a PDF, TXT, or Markdown file (max 10 MB)
4. The file is saved to `/data/documents` and indexed automatically

### Via the file system

1. Copy files into `data/documents/`
2. Run `npm run ingest` or click **"Re-index All Documents"**

---

## Example Questions

Try asking:

- *"What is SkyNixa's remote work policy?"*
- *"How many PTO days do new employees get?"*
- *"What are the IT password requirements?"*
- *"What are the onboarding steps for new hires?"*
- *"Does SkyNixa offer parental leave?"*
- *"What is the 401(k) company match?"*
- *"How do I report a security incident?"*

---

## Project Structure

```
skynixa-rag-chatbot/
├── app/                  # Next.js pages and API routes
├── components/           # React UI components
├── lib/                  # RAG pipeline logic
├── data/
│   ├── documents/        # Company policy files
│   └── chroma/           # Vector database storage
├── docs/                 # Technical documentation
└── scripts/              # CLI ingest script
```

---

## GitHub-Ready Project

This repository is ready to push to GitHub:

- No secrets in source code (use `.env.local`, not committed)
- `.gitignore` excludes `node_modules`, `.env`, and Chroma data
- Sample documents included for immediate demo
- Full documentation in `/docs`

**LinkedIn summary:** See [docs/PROJECT_EXPLANATION.md](docs/PROJECT_EXPLANATION.md).

---

## License

MIT — free for learning and internal company use.
