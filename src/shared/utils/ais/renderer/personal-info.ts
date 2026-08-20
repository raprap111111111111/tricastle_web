// src/shared/utils/ais/renderer/personal-info.ts

import type { jsPDF } from 'jspdf'
import type { AISData, AISLayout } from '../types'
import { fmt, fmtBool, fmtDate } from '../formatters'
import { drawSectionHeader, makeRowDrawer } from './helpers'

/**
 * Render POSITION/TRADE TEST rows + PERSONAL INFORMATION section.
 * Returns new Y position.
 */
export function renderPersonalInfo(
  doc:    jsPDF,
  data:   AISData,
  layout: AISLayout,
  y:      number,
  photoY: number,
): number {
  const { marginL, infoW, photoH } = layout

  // ─── POSITION / TRADE TEST ─────────────────────────────────────────────
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('POSITION', marginL, y)
  doc.text(':', marginL + 25, y)
  doc.setFont('helvetica', 'normal')
  doc.text(fmt(data.position), marginL + 28, y)

  doc.setFont('helvetica', 'bold')
  doc.text('TRADE TEST TRY', marginL + 90, y)
  doc.setFont('helvetica', 'normal')
  doc.text(fmt(data.trade_test_try || '1st'), marginL + 128, y)
  y += 4

  doc.setFont('helvetica', 'bold')
  doc.text('TRADE TEST DATE', marginL, y)
  doc.text(':', marginL + 40, y)
  doc.setFont('helvetica', 'normal')
  doc.text(fmt(data.trade_test_date), marginL + 43, y)
  y += 5

  // ─── PERSONAL INFORMATION header ───────────────────────────────────────
  y = drawSectionHeader(doc, 'PERSONAL INFORMATION', y, infoW, marginL) - 1

  const {
    labelX, colonX, valueX,
    rightLabelX, rightColonX, rightValX,
    drawRow,
  } = makeRowDrawer(doc, marginL)

  const rowGap = 4

  // Name row
  doc.setFont('helvetica', 'bold')
  doc.text('Name', labelX, y)
  doc.text(':', colonX, y)
  doc.setFont('helvetica', 'normal')
  doc.text(fmt(data.last_name),   marginL + 33,  y)
  doc.text(fmt(data.first_name),  marginL + 72,  y)
  doc.text(fmt(data.middle_name), marginL + 115, y)
  y += rowGap

  drawRow('Current Address', fmt(data.current_address), y)
  y += rowGap

  drawRow('Contact Number', fmt(data.contact_number), y)
  drawRow('Blood Type', fmt(data.blood_type), y, true)
  doc.setFont('helvetica', 'bold')
  doc.text('English:', marginL + 148, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.english_percent !== undefined ? `${data.english_percent}%` : '', marginL + 165, y)
  y += rowGap

  drawRow('Date of Birth', fmtDate(data.date_of_birth), y)
  drawRow('Birthplace', fmt(data.birthplace), y, true)
  y += rowGap

  // Age + Civil Status
  doc.setFont('helvetica', 'bold')
  doc.text('Age', labelX, y)
  doc.text(':', colonX, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.age !== undefined ? String(data.age) : '', valueX, y)
  doc.text('years old', valueX + 10, y)
  drawRow('Civil Status', fmt(data.civil_status), y, true)
  y += rowGap

  // Height + Weight
  doc.setFont('helvetica', 'bold')
  doc.text('Height', labelX, y)
  doc.text(':', colonX, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.height_cm !== undefined ? String(data.height_cm) : '', valueX, y)
  doc.text('cm.', valueX + 10, y)
  doc.setFont('helvetica', 'bold')
  doc.text('Weight', rightLabelX, y)
  doc.text(':', rightColonX, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.weight_kg !== undefined ? String(data.weight_kg) : '', rightValX, y)
  doc.text('kgs.', rightValX + 10, y)
  y += rowGap

  drawRow('No. of Children', String(data.number_of_children ?? ''), y)
  drawRow('Smoking', fmtBool(data.is_smoking), y, true)
  y += rowGap

  if (data.smoking_frequency) {
    doc.setFont('helvetica', 'normal')
    doc.text(data.smoking_frequency, rightValX, y)
    y += 4
  }

  drawRow('Religion', fmt(data.religion), y)
  drawRow('Alcohol', fmtBool(data.is_drinking), y, true)
  y += rowGap

  if (data.drinking_frequency) {
    doc.setFont('helvetica', 'normal')
    doc.text(data.drinking_frequency, rightValX, y)
    y += 4
  }

  drawRow('Dominant Hand', fmt(data.dominant_hand), y)
  y += rowGap

  return Math.max(y + 3, photoY + photoH + 5)
}