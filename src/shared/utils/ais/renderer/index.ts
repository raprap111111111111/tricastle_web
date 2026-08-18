// src/shared/utils/ais/renderer/index.ts

import type jsPDF from 'jspdf'
import type { AISData } from '../types'
import { DEFAULT_LAYOUT } from '../types'
import { renderHeader }            from './header'
import { renderPersonalInfo }      from './personal-info'
import { renderFamilyBackground }  from './family'
import { renderEducation }         from './education'
import { renderWorkExperience }    from './work'
import { renderContactsInJapan }   from './contacts'
import { renderSignatures }        from './signatures'

/**
 * Render the full AIS layout onto the current page of the given jsPDF instance.
 * Does NOT save or add pages. Callers control that.
 */
export async function renderAISOnDoc(doc: jsPDF, data: AISData): Promise<void> {
  const layout = DEFAULT_LAYOUT

  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.3)

  let y = 10

  // 1️⃣  Header (logo, wordmark, POEA, address, photo, title)
  const headerResult = await renderHeader(doc, data, layout, y)
  y = headerResult.y

  // 2️⃣  Personal information + POSITION/TRADE TEST
  y = renderPersonalInfo(doc, data, layout, y, headerResult.photoY)

  // 3️⃣  Family background
  y = renderFamilyBackground(doc, data, layout, y)

  // 4️⃣  Educational attainment
  y = renderEducation(doc, data, layout, y)

  // 5️⃣  Work experience
  y = renderWorkExperience(doc, data, layout, y)

  // 6️⃣  Contacts in Japan (MARUCON + Non-MARUCON)
  y = renderContactsInJapan(doc, data, layout, y)

  // 7️⃣  Signatures
  renderSignatures(doc, data, layout, y)
}