// src/shared/utils/ais/renderer/signatures.ts

import type { jsPDF } from 'jspdf'
import type { AISData, AISLayout } from '../types'
import { fmt } from '../formatters'

export function renderSignatures(
  doc:    jsPDF,
  data:   AISData,
  layout: AISLayout,
  y:      number,
): number {
  const { marginL, contentW } = layout
  const sigW = (contentW - 4) / 2
  const sigH = 28

  drawTraineeBox(doc, data, marginL, y, sigW, sigH)
  drawAisByBox(doc, data, marginL + sigW + 4, y, sigW, sigH)

  return y + sigH
}

// ─── Private ─────────────────────────────────────────────────────────────────

function drawTraineeBox(
  doc:    jsPDF,
  data:   AISData,
  x:      number,
  y:      number,
  w:      number,
  h:      number,
): void {
  doc.rect(x, y, w, h)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('This is to certify that the information above is true and correct.', x + 3, y + 4)

  if (data.trainee_signature) {
    try {
      doc.addImage(data.trainee_signature, 'PNG', x + 8, y + 8, 40, 10)
    } catch { /* ignore */ }
  }

  if (data.signature_date) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(data.signature_date, x + 60, y + 20)
  }

  // Signature lines
  doc.line(x + 3,  y + 22, x + 55,   y + 22)
  doc.line(x + 58, y + 22, x + w - 3, y + 22)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text("TRAINEE'S SIGNATURE", x + 12, y + 25)
  doc.text('DATE', x + 75, y + 25)
}

function drawAisByBox(
  doc:    jsPDF,
  data:   AISData,
  x:      number,
  y:      number,
  w:      number,
  h:      number,
): void {
  doc.rect(x, y, w, h)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('AIS By:', x + 3, y + 5)

  doc.text(fmt(data.ais_by), x + w / 2, y + 18, { align: 'center' })

  doc.line(x + 15, y + 22, x + w - 3, y + 22)
  doc.setFontSize(7)
  doc.text('Staff', x + w / 2, y + 25, { align: 'center' })
}