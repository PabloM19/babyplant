import { parseCommercialDocument } from '@/lib/parse-commercial-document'
import type { ParseHints, ParsedDocument, ParsedDocumentLine } from '@/lib/document-catalog'

export type ParsedAlbaranLine = ParsedDocumentLine
export type ParsedAlbaran = ParsedDocument
export type { ParseHints }

export function parseAlbaranText(rawText: string, hints: ParseHints = {}): ParsedAlbaran {
  return parseCommercialDocument(rawText, hints)
}

export async function extractTextFromPdf(file: ArrayBuffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString()

  const doc = await pdfjs.getDocument({ data: new Uint8Array(file) }).promise
  const chunks: string[] = []

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join('\n')
    chunks.push(pageText)
  }

  return chunks.join('\n')
}

export async function parseAlbaranPdf(file: ArrayBuffer, hints: ParseHints = {}): Promise<ParsedAlbaran> {
  const rawText = await extractTextFromPdf(file)
  return parseAlbaranText(rawText, hints)
}
