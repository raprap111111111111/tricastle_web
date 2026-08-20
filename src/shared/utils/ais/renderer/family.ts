// src/shared/utils/ais/renderer/family.ts

import type { jsPDF } from 'jspdf'
import type { AISData, AISLayout } from '../types'
import { fmt } from '../formatters'
import { drawSectionHeader } from './helpers'

export function renderFamilyBackground(
  doc:    jsPDF,
  data:   AISData,
  layout: AISLayout,
  y:      number,
): number {
  const { marginL, contentW } = layout

  y = drawSectionHeader(doc, 'FAMILY BACKGROUND', y, contentW, marginL)

  // Bullet notes
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const notes = data.family_background_notes ?? []
  notes.slice(0, 3).forEach((line, i) => {
    if (line?.trim()) {
      doc.text(`:  ${line}`, marginL + 20, y + i * 3.5)
    }
  })
  y += Math.max(notes.length * 3.5, 12)

  // Wife
  doc.setFont('helvetica', 'bold')
  doc.text('Wife', marginL + 15, y)
  doc.text(':', marginL + 32, y)
  doc.setFont('helvetica', 'normal')
  doc.text(fmt(data.spouse_name), marginL + 35, y)

  // Work / Salary
  doc.setFont('helvetica', 'bold')
  doc.text('Work', marginL + 110, y - 4)
  doc.text(':', marginL + 125, y - 4)
  doc.setFont('helvetica', 'normal')
  doc.text(fmt(data.spouse_work), marginL + 128, y - 4)

  doc.setFont('helvetica', 'bold')
  doc.text('Salary', marginL + 110, y)
  doc.text(':', marginL + 125, y)
  doc.setFont('helvetica', 'normal')
  doc.text(fmt(data.spouse_salary), marginL + 128, y)

  return y + 6
}