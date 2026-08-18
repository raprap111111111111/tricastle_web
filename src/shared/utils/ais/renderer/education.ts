// src/shared/utils/ais/renderer/education.ts

import type jsPDF from 'jspdf'
import type { AISData, AISLayout } from '../types'
import { fmt } from '../formatters'
import { drawSectionHeader } from './helpers'

export function renderEducation(
  doc:    jsPDF,
  data:   AISData,
  layout: AISLayout,
  y:      number,
): number {
  const { marginL, contentW } = layout

  y = drawSectionHeader(
    doc, 'EDUCATIONAL ATTAINMENT', y, contentW, marginL,
    'Month & Year Started & Graduated',
  )

  // Vocational
  doc.setFont('helvetica', 'bold')
  doc.text('Vocational', marginL, y)
  doc.setFont('helvetica', 'normal')
  doc.text(fmt(data.vocational), marginL + 33, y)
  y += 6

  // High School + GRADUATED label
  doc.setFont('helvetica', 'bold')
  doc.text('High School', marginL, y)
  doc.setFont('helvetica', 'normal')
  doc.text(fmt(data.high_school), marginL + 33, y)

  doc.setFont('helvetica', 'bold')
  doc.text('GRADUATED', marginL + 130, y)
  y += 4

  // Remarks + date range
  doc.setFont('helvetica', 'bold')
  doc.text('Remarks', marginL, y)
  doc.text(':', marginL + 22, y)
  doc.setFont('helvetica', 'normal')
  doc.text(fmt(data.education_remarks), marginL + 25, y)

  doc.text(fmt(data.year_started), marginL + 130, y)
  doc.text(fmt(data.year_ended), marginL + 160, y)

  return y + 6
}