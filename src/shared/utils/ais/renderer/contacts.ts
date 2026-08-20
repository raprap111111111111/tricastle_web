// src/shared/utils/ais/renderer/contacts.ts

import type { jsPDF } from 'jspdf'
import type { AISData, AISLayout } from '../types'
import { fmt } from '../formatters'

export function renderContactsInJapan(
  doc:    jsPDF,
  data:   AISData,
  layout: AISLayout,
  y:      number,
): number {
  const { marginL } = layout

  // ─── MARUCON block ─────────────────────────────────────────────────────
  y = renderContactBlock(
    doc, marginL, y,
    'Do you know anyone in Japan affiliated in MARUCON?  If yes, please provide basic information:',
    {
      name:     fmt(data.marucon_name),
      company:  fmt(data.marucon_company),
      relation: fmt(data.marucon_relation),
      extraLabel: 'Batch No:',
      extraValue: fmt(data.marucon_batch),
    },
  )

  y += 6

  // ─── Non-MARUCON block ─────────────────────────────────────────────────
  y = renderContactBlock(
    doc, marginL, y,
    'Do you know anyone in Japan not affiliated in MARUCON?  If yes, please provide basic information:',
    {
      name:     fmt(data.non_marucon_name),
      company:  fmt(data.non_marucon_company),
      relation: fmt(data.non_marucon_relation),
      extraLabel: 'Contact No.:',
      extraValue: fmt(data.non_marucon_contact),
    },
  )

  return y + 8
}

// ─── Private helpers ─────────────────────────────────────────────────────────

interface ContactBlockData {
  name:       string
  company:    string
  relation:   string
  extraLabel: string
  extraValue: string
}

function renderContactBlock(
  doc:      jsPDF,
  marginL:  number,
  y:        number,
  question: string,
  info:     ContactBlockData,
): number {
  // Question line
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text(question, marginL, y)
  y += 4

  // Name + extra field (Batch No / Contact No)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Name', marginL, y)
  doc.text(':', marginL + 22, y)
  doc.setFont('helvetica', 'normal')
  doc.text(info.name, marginL + 25, y)

  doc.setFont('helvetica', 'bold')
  doc.text(info.extraLabel, marginL + 115, y)
  doc.setFont('helvetica', 'normal')
  doc.text(info.extraValue, marginL + 140, y)
  y += 4

  // Company
  doc.setFont('helvetica', 'bold')
  doc.text('Company', marginL, y)
  doc.text(':', marginL + 22, y)
  doc.setFont('helvetica', 'normal')
  doc.text(info.company, marginL + 25, y)
  y += 4

  // Relation
  doc.setFont('helvetica', 'bold')
  doc.text('Relation', marginL, y)
  doc.text(':', marginL + 22, y)
  doc.setFont('helvetica', 'normal')
  doc.text(info.relation, marginL + 25, y)

  return y
}