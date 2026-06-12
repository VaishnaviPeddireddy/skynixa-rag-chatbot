# Project Explanation — SkyNixa Company Policy Assistant

## LinkedIn Summary

> I built a RAG-based company policy assistant that helps employees ask natural-language questions from company documents such as HR policies, onboarding guides, IT rules, and internal updates. The chatbot retrieves the most relevant document sections and generates grounded answers with source references.

---

## Why This Project Is Useful for Companies

Modern companies produce hundreds of internal documents — employee handbooks, security policies, benefits guides, and onboarding checklists. Employees rarely read them cover to cover. When they need an answer, they email HR, search SharePoint, or ask a colleague. This is slow, inconsistent, and burdensome for support teams.

A RAG chatbot solves this by making institutional knowledge **searchable in plain English** while keeping answers **grounded in official documents** — reducing hallucination compared to a generic chatbot.

---

## What Problem It Solves

| Problem | How SkyNixa Assistant Helps |
|---------|----------------------------|
| Scattered policy documents | Single chat interface for all policies |
| Repeated HR/IT questions | Self-service answers 24/7 |
| Long PDF handbooks | Retrieves only relevant sections |
| Outdated verbal answers | Always cites the source document |
| Privacy concerns with cloud AI | Runs entirely on local Ollama — no data leaves the machine |

---

## How It Helps HR, IT, and Onboarding Teams

### HR Team
- New hires ask about PTO, parental leave, and performance reviews without emailing HR.
- Policy updates: upload a new document and re-index — answers reflect the latest version.
- Reduces ticket volume for common questions.

### IT / Security Team
- Employees self-serve password rules, VPN requirements, and incident reporting steps.
- Security policies are enforced consistently because answers come from the official doc.
- Frees IT help desk from repetitive policy questions.

### Onboarding Team
- Day-1 and Week-1 checklists are queryable: *"What training is due in my first 30 days?"*
- New hires get instant answers about equipment, contacts, and required training.
- Onboarding buddies spend less time answering basic logistics questions.

---

## Technical Highlights (for interviews / portfolio)

- **RAG architecture** — retrieval + generation, not pure LLM prompting
- **Local-first** — Ollama for both embeddings and chat; no paid APIs
- **Source citations** — transparency and trust for enterprise use
- **Full-stack TypeScript** — Next.js API routes + React UI
- **Production patterns** — chunking, top-K retrieval, system prompts, error handling

---

## Future Improvements

1. **Authentication** — SSO login so only employees access the chatbot
2. **Admin dashboard** — manage documents, view usage analytics, delete outdated files
3. **Conversation memory** — follow-up questions like *"And what about dependents?"*
4. **Hybrid search** — combine vector similarity with keyword search (BM25) for better accuracy
5. **Document versioning** — track which policy version an answer came from
6. **Slack / Teams integration** — ask policy questions where employees already work
7. **Multi-language support** — answer in the employee's preferred language
8. **Automated re-indexing** — watch a folder or connect to Google Drive / SharePoint
9. **Feedback loop** — thumbs up/down to improve retrieval quality over time
10. **Docker deployment** — one-command setup for on-premise company servers

---

## Demo Scenario

1. HR uploads `hr-policy.txt` and `benefits-overview.txt`
2. New employee asks: *"How many PTO days do I get?"*
3. Chatbot retrieves the PTO section from `hr-policy.txt`
4. Ollama generates: *"New employees at SkyNixa receive 15 PTO days per year, accrued monthly..."*
5. Source card shows: `hr-policy.txt` with excerpt

This demonstrates grounded, citeable, self-service internal knowledge — the core value of enterprise RAG.
