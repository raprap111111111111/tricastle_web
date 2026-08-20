// src/shared/utils/ais/renderer/header.ts

import type { jsPDF } from 'jspdf'
import type { AISData, AISLayout } from '../types'
import { loadLogoBase64, loadWordmarkBase64 } from '../assets'

/**
 * Render the top header (logo + company + POEA + address + photo).
 * Returns the new Y position after the header.
 */
export async function renderHeader(
  doc:    jsPDF,
  data:   AISData,
  layout: AISLayout,
  y:      number,
): Promise<{ y: number; photoY: number }> {
  const { marginL, infoW, photoW, photoH, rightX } = layout
  const headerH = 20

  const [logoBase64, wordmarkBase64] = await Promise.all([
    loadLogoBase64(),
    loadWordmarkBase64(),
  ])

  // Logo
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', marginL + 8, y + 1, 14, 14)
    } catch (e) {
      console.warn('[AIS] Failed to embed logo:', e)
    }
  }

  // Wordmark or fallback text
  const wordmarkX = marginL + 32 + 45
  if (wordmarkBase64) {
    try {
      doc.addImage(wordmarkBase64, 'PNG', marginL + 32, y + 1, 90, 6)
    } catch {
      drawWordmarkText(doc, wordmarkX, y)
    }
  } else {
    drawWordmarkText(doc, wordmarkX, y)
  }

  // POEA
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('POEA - 097-083122 - R', wordmarkX, y + 11, { align: 'center' })

  // Address
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.text(
    'No. 41 Rosas Corner, Barangay 39, Bacolod City, 6100 Philippines   Tel. No. (034) 435-2336',
    wordmarkX, y + 15, { align: 'center' },
  )

  // Photo box
  const photoY = y
  drawPhotoBox(doc, data, rightX, photoY, photoW, photoH)

  // Title bar
  const titleY = y + headerH
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('APPLICANT INFORMATION SHEET', marginL + infoW / 2, titleY + 3, { align: 'center' })

  return { y: titleY + 6, photoY }
}

// ─── Private helpers ─────────────────────────────────────────────────────────

function drawWordmarkText(doc: jsPDF, x: number, y: number): void {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('TRICASTLE INTERNATIONAL, INC.', x, y + 8, { align: 'center' })
}

function drawPhotoBox(
  doc:    jsPDF,
  data:   AISData,
  x:      number,
  y:      number,
  w:      number,
  h:      number,
): void {
  doc.rect(x, y, w, h)
  if (data.photo) {
    try {
      doc.addImage(data.photo, 'JPEG', x + 0.5, y + 0.5, w - 1, h - 1)
    } catch (e) {
      console.warn('[AIS] Photo embed failed', e)
    }
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(180, 180, 180)
    doc.text('PHOTO', x + w / 2, y + h / 2, { align: 'center' })
    doc.setTextColor(0, 0, 0)
  }
}