import fs from "fs/promises";
import path from "path";

/**
 * Supported file extensions for company policy documents.
 */
const SUPPORTED_EXTENSIONS = [".pdf", ".txt", ".md", ".markdown"];

export interface LoadedDocument {
  /** Original file name (e.g. "hr-policy.txt") */
  fileName: string;
  /** Extracted plain text content */
  text: string;
  /** File type for metadata */
  fileType: string;
}

/**
 * Check whether a file extension is supported for ingestion.
 */
export function isSupportedDocument(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

/**
 * Extract text from a PDF buffer using pdf-parse.
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  // Dynamic import keeps pdf-parse out of the client bundle
  const pdfParse = (await import("pdf-parse")).default;
  const result = await pdfParse(buffer);
  return result.text;
}

/**
 * Load a single document from disk and extract its text content.
 * Supports PDF, TXT, and Markdown files.
 */
export async function loadDocumentFromFile(
  filePath: string
): Promise<LoadedDocument> {
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName).toLowerCase();

  if (!isSupportedDocument(fileName)) {
    throw new Error(
      `Unsupported file type "${ext}". Use PDF, TXT, or Markdown.`
    );
  }

  const buffer = await fs.readFile(filePath);

  let text: string;

  if (ext === ".pdf") {
    text = await extractPdfText(buffer);
  } else {
    // TXT and Markdown are read as UTF-8 text
    text = buffer.toString("utf-8");
  }

  if (!text.trim()) {
    throw new Error(`Document "${fileName}" appears to be empty.`);
  }

  return {
    fileName,
    text: text.trim(),
    fileType: ext.replace(".", ""),
  };
}

/**
 * Load all supported documents from the documents directory.
 */
export async function loadAllDocuments(
  documentsDir: string
): Promise<LoadedDocument[]> {
  let entries: string[];

  try {
    entries = await fs.readdir(documentsDir);
  } catch {
    throw new Error(`Documents directory not found: ${documentsDir}`);
  }

  const supported = entries.filter(isSupportedDocument);
  const documents: LoadedDocument[] = [];

  for (const fileName of supported) {
    const filePath = path.join(documentsDir, fileName);
    const stat = await fs.stat(filePath);
    if (stat.isFile()) {
      documents.push(await loadDocumentFromFile(filePath));
    }
  }

  return documents;
}
