// src/shared/utils/ais/generator.ts

import jsPDF from 'jspdf'
import JSZip from 'jszip'

import type { AISData, BulkAISMode, BulkProgress } from './types'
import { renderAISOnDoc }   from './renderer'
import { mapApplicantToAIS, attachPhoto } from './mapper'
import { triggerDownload, makeSafeFileName } from './download'

// ─── Internal ────────────────────────────────────────────────────────────────

/** Build a jsPDF document for one applicant (does not save). */
async function buildAISDoc(data: AISData): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  await renderAISOnDoc(doc, data)
  return doc
}

/** Prepare AISData for an applicant, attaching photo if available. */
async function prepareApplicantData(applicant: any, staffName?: string): Promise<AISData> {
  const aisData = mapApplicantToAIS(applicant, staffName)
  await attachPhoto(applicant, aisData)
  return aisData
}

/** Consistent progress-callback helper. */
function makeProgressReporter(
  total:      number,
  onProgress?: (p: BulkProgress) => void,
) {
  return (current: number, applicant: any) => {
    onProgress?.({
      current,
      total,
      applicant: `${applicant.first_name ?? ''} ${applicant.last_name ?? ''}`.trim(),
    })
  }
}

// ─── Public — Single ─────────────────────────────────────────────────────────

/** Generate a single AIS PDF and trigger download. */
export async function generateAIS(data: AISData): Promise<void> {
  const doc      = await buildAISDoc(data)
  const fileName = `AIS_${data.applicant_code ?? 'applicant'}_${Date.now()}.pdf`
  doc.save(fileName)
}

// ─── Public — Bulk ───────────────────────────────────────────────────────────

/**
 * Bulk-generate AIS PDFs.
 *
 * @param applicants Array of applicant records from your API/store
 * @param staffName  Optional staff name shown in "AIS By" box
 * @param mode       'zip' → separate files bundled in .zip
 *                   'merged' → single multi-page PDF
 * @param onProgress Optional progress callback
 */
export async function generateBulkAIS(
  applicants:  any[],
  staffName?:  string,
  mode:        BulkAISMode = 'zip',
  onProgress?: (p: BulkProgress) => void,
): Promise<void> {
  if (applicants.length === 0) return

  if (mode === 'merged') {
    await generateBulkMerged(applicants, staffName, onProgress)
  } else {
    await generateBulkZIP(applicants, staffName, onProgress)
  }
}

// ─── Bulk modes ──────────────────────────────────────────────────────────────

async function generateBulkZIP(
  applicants: any[],
  staffName?: string,
  onProgress?: (p: BulkProgress) => void,
): Promise<void> {
  const zip      = new JSZip()
  const total    = applicants.length
  const report   = makeProgressReporter(total, onProgress)

  for (let i = 0; i < total; i++) {
    const applicant = applicants[i]
    const aisData   = await prepareApplicantData(applicant, staffName)
    const doc       = await buildAISDoc(aisData)

    zip.file(makeSafeFileName(applicant), doc.output('blob'))
    report(i + 1, applicant)
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  triggerDownload(zipBlob, `AIS_bulk_${total}_applicants_${Date.now()}.zip`)
}

async function generateBulkMerged(
  applicants: any[],
  staffName?: string,
  onProgress?: (p: BulkProgress) => void,
): Promise<void> {
  const total     = applicants.length
  const report    = makeProgressReporter(total, onProgress)
  const masterDoc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  for (let i = 0; i < total; i++) {
    const applicant = applicants[i]
    const aisData   = await prepareApplicantData(applicant, staffName)

    if (i > 0) masterDoc.addPage()
    await renderAISOnDoc(masterDoc, aisData)

    report(i + 1, applicant)
  }

  masterDoc.save(`AIS_bulk_${total}_applicants_${Date.now()}.pdf`)
}