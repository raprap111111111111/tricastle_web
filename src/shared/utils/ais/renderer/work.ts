// src/shared/utils/ais/renderer/work.ts

import type { jsPDF } from 'jspdf'
import type { AISData, AISLayout } from '../types'
import { fmt } from '../formatters'
import { drawSectionHeader } from './helpers'

export function renderWorkExperience(
  doc:    jsPDF,
  data:   AISData,
  layout: AISLayout,
  y:      number,
): number {
  const { marginL, contentW } = layout

  y = drawSectionHeader(doc, 'WORK EXPERIENCE / JOB DESCRIPTION', y, contentW, marginL)

  // "has experienced working as X for Y year/s & Z month/s"
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(':  has experienced working as', marginL + 15, y)
  doc.setFont('helvetica', 'bold')
  doc.text(fmt(data.present_job_title), marginL + 72, y)
  doc.setFont('helvetica', 'normal')
  doc.text('for', marginL + 125, y)
  doc.setFont('helvetica', 'bold')
  doc.text(String(data.work_years ?? ''), marginL + 132, y)
  doc.setFont('helvetica', 'normal')
  doc.text('year/s &', marginL + 138, y)
  doc.setFont('helvetica', 'bold')
  doc.text(String(data.work_months ?? ''), marginL + 158, y)
  doc.setFont('helvetica', 'normal')
  doc.text('month/s', marginL + 165, y)
  y += 4

  // Job description
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  if (data.present_job_description) {
    doc.text(fmt(data.present_job_description), marginL + 20, y)
  }
  y += 4

  // Present Job + Salary
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Present Job', marginL, y)
  doc.text(':', marginL + 28, y)
  doc.setFont('helvetica', 'normal')
  doc.text(fmt(data.present_job_role), marginL + 31, y)

  doc.setFont('helvetica', 'bold')
  doc.text('Salary:', marginL + 115, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.salary_amount ? `P ${data.salary_amount}` : '', marginL + 132, y)
  doc.text('per day', marginL + 160, y)
  y += 5

  // Overseas
  doc.setFont('helvetica', 'bold')
  doc.text('Overseas', marginL, y)
  doc.text(':', marginL + 28, y)

  doc.text('Duration: for', marginL + 115, y)
  doc.setFont('helvetica', 'normal')
  doc.text(String(data.overseas_duration_years ?? ''), marginL + 143, y)
  doc.setFont('helvetica', 'bold')
  doc.text('year/s &', marginL + 148, y)
  doc.setFont('helvetica', 'normal')
  doc.text(String(data.overseas_duration_months ?? ''), marginL + 168, y)
  doc.setFont('helvetica', 'bold')
  doc.text('month/s', marginL + 173, y)

  return y + 6
}