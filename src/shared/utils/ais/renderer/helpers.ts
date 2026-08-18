// src/shared/utils/ais/renderer/helpers.ts

import type jsPDF from 'jspdf'
import type { AISLayout } from '../types'

/**
 * Draw a gray section header bar (e.g. "PERSONAL INFORMATION").
 * Returns the new Y position after the header.
 */
export function drawSectionHeader(
  doc:     jsPDF,
  label:   string,
  y:       number,
  width:   number,
  marginL: number,
  extraRight?: string,
): number {
  const sectionH = 5

  doc.setFillColor(220, 220, 220)
  doc.rect(marginL, y, width, sectionH, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(0, 0, 0)
  doc.text(label, marginL + 2, y + 3.5)

  if (extraRight) {
    doc.text(extraRight, marginL + 115, y + 3.5)
  }

  return y + sectionH + 3
}

/**
 * Factory for a row drawer with pre-calculated column positions.
 */
export function makeRowDrawer(doc: jsPDF, marginL: number) {
  const labelX      = marginL
  const colonX      = marginL + 28
  const valueX      = marginL + 31
  const rightLabelX = marginL + 90
  const rightColonX = marginL + 115
  const rightValX   = marginL + 118

  return {
    labelX, colonX, valueX,
    rightLabelX, rightColonX, rightValX,

    /** Draw "Label : Value" pair. */
    drawRow(label: string, value: string, yPos: number, isRight = false) {
      const lx = isRight ? rightLabelX : labelX
      const cx = isRight ? rightColonX : colonX
      const vx = isRight ? rightValX   : valueX
      doc.setFont('helvetica', 'bold')
      doc.text(label, lx, yPos)
      doc.text(':', cx, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(value, vx, yPos)
    },
  }
}