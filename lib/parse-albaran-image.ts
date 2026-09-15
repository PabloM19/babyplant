import Tesseract from 'tesseract.js'
import type { ParseHints, ParsedDocument, ParsedDocumentLine } from '@/lib/document-catalog'
import { parseAlbaranText } from './parse-albaran-pdf'

export type ParsedAlbaran = ParsedDocument
export type ParsedAlbaranLine = ParsedDocumentLine
export type { ParsedDocument, ParsedDocumentLine }

export async function extractTextFromImage(source: Blob | File | HTMLCanvasElement): Promise<string> {
  const result = await Tesseract.recognize(source, 'spa', {
    logger: () => {},
  })
  return result.data.text
}

export async function parseAlbaranImage(
  source: Blob | File | HTMLCanvasElement,
  hints: ParseHints = {},
): Promise<ParsedAlbaran> {
  const rawText = await extractTextFromImage(source)
  return parseAlbaranText(rawText, hints)
}

export async function parseAlbaranCapture(canvas: HTMLCanvasElement, hints: ParseHints = {}): Promise<ParsedAlbaran> {
  return parseAlbaranImage(canvas, hints)
}
