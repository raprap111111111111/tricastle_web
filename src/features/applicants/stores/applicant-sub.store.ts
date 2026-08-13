// src/features/applicants/stores/applicant-sub.store.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { lifestyleApi }  from '../api/applicant-lifestyle.api'
import { educationApi }  from '../api/applicant-education.api'
import { employmentApi } from '../api/applicant-employment.api'
import { tattooApi }     from '../api/applicant-tattoo.api'
import { applicantApi }  from '../api/applicant.api'          // ← add this import
import type {
  ApplicantLifestyle,
  ApplicantEducation,
  ApplicantEmployment,
  ApplicantTattoo,
  UpsertLifestylePayload,
  CreateEducationPayload,
  UpdateEducationPayload,
  CreateEmploymentPayload,
  UpdateEmploymentPayload,
  CreateTattooPayload,
  UpdateTattooPayload,
} from '../types'

export const useApplicantSubStore = defineStore('applicant-sub', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const lifestyle   = ref<ApplicantLifestyle | null>(null)
  const educations  = ref<ApplicantEducation[]>([])
  const employments = ref<ApplicantEmployment[]>([])
  const tattoos     = ref<ApplicantTattoo[]>([])
  const loading     = ref(false)
  const submitting  = ref(false)
  const error       = ref<string | null>(null)

  // ─── Lifestyle ────────────────────────────────────────────────────────────
  async function fetchLifestyle(applicantId: number) {
    loading.value = true
    try {
      lifestyle.value = await lifestyleApi.getByApplicant(applicantId)
    } catch {
      lifestyle.value = null
    } finally {
      loading.value = false
    }
  }

  async function upsertLifestyle(payload: UpsertLifestylePayload) {
    submitting.value = true
    error.value = null
    try {
      lifestyle.value = await lifestyleApi.upsert(payload)
      return lifestyle.value
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to save lifestyle'
      throw e
    } finally {
      submitting.value = false
    }
  }

  // ─── Education ────────────────────────────────────────────────────────────
  async function fetchEducations(applicantId: number) {
    loading.value = true
    try {
      educations.value = await educationApi.listByApplicant(applicantId)
    } catch {
      educations.value = []
    } finally {
      loading.value = false
    }
  }

  async function createEducation(payload: CreateEducationPayload) {
    submitting.value = true
    error.value = null
    try {
      const created = await educationApi.create(payload)
      educations.value.push(created)
      return created
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to add education'
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function updateEducation(id: number, payload: UpdateEducationPayload) {
    submitting.value = true
    error.value = null
    try {
      const updated = await educationApi.update(id, payload)
      const idx = educations.value.findIndex((e) => e.id === id)
      if (idx !== -1) educations.value[idx] = updated
      return updated
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to update education'
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function deleteEducation(id: number) {
    submitting.value = true
    try {
      await educationApi.remove(id)
      educations.value = educations.value.filter((e) => e.id !== id)
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to delete education'
      throw e
    } finally {
      submitting.value = false
    }
  }

  // ─── Employment ───────────────────────────────────────────────────────────
  async function fetchEmployments(applicantId: number) {
    loading.value = true
    try {
      employments.value = await employmentApi.listByApplicant(applicantId)
    } catch {
      employments.value = []
    } finally {
      loading.value = false
    }
  }

  async function createEmployment(payload: CreateEmploymentPayload) {
    submitting.value = true
    error.value = null
    try {
      const created = await employmentApi.create(payload)
      employments.value.push(created)
      return created
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to add employment'
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function updateEmployment(id: number, payload: UpdateEmploymentPayload) {
    submitting.value = true
    error.value = null
    try {
      const updated = await employmentApi.update(id, payload)
      const idx = employments.value.findIndex((e) => e.id === id)
      if (idx !== -1) employments.value[idx] = updated
      return updated
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to update employment'
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function deleteEmployment(id: number) {
    submitting.value = true
    try {
      await employmentApi.remove(id)
      employments.value = employments.value.filter((e) => e.id !== id)
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to delete employment'
      throw e
    } finally {
      submitting.value = false
    }
  }

  // ─── Tattoos ──────────────────────────────────────────────────────────────
  async function fetchTattoos(applicantId: number) {
    loading.value = true
    try {
      tattoos.value = await tattooApi.listByApplicant(applicantId)
    } catch {
      tattoos.value = []
    } finally {
      loading.value = false
    }
  }

  async function createTattoo(payload: CreateTattooPayload) {
    submitting.value = true
    error.value = null
    try {
      const created = await tattooApi.create(payload)
      tattoos.value.push(created)
      return created
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to add tattoo'
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function updateTattoo(id: number, payload: UpdateTattooPayload) {
    submitting.value = true
    error.value = null
    try {
      const updated = await tattooApi.update(id, payload)
      const idx = tattoos.value.findIndex((t) => t.id === id)
      if (idx !== -1) tattoos.value[idx] = updated
      return updated
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to update tattoo'
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function deleteTattoo(id: number) {
    submitting.value = true
    try {
      await tattooApi.remove(id)
      tattoos.value = tattoos.value.filter((t) => t.id !== id)
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to delete tattoo'
      throw e
    } finally {
      submitting.value = false
    }
  }

  // ─── Biodata Upload ────────────────────────────────────────────────────────
  // Non-fatal by design — caller catches and shows a warn toast.
  // Uses existing POST /applicant-documents endpoint.
  async function uploadBiodata(
    applicantId:    number,
    file:           File,
    documentTypeId: number,
    notes?:         string,
  ) {
    submitting.value = true
    error.value      = null
    try {
      return await applicantApi.uploadBiodata(applicantId, file, documentTypeId, notes)
    } catch (e: any) {
      error.value =
        e?.response?.data?.message ??
        e?.message ??
        'Failed to upload biodata'
      throw e
    } finally {
      submitting.value = false
    }
  }

  // ─── Fetch All ────────────────────────────────────────────────────────────
  async function fetchAllSubData(applicantId: number) {
    loading.value = true
    try {
      await Promise.allSettled([
        fetchLifestyle(applicantId),
        fetchEducations(applicantId),
        fetchEmployments(applicantId),
        fetchTattoos(applicantId),
      ])
    } finally {
      loading.value = false
    }
  }

  function clearAll() {
    lifestyle.value   = null
    educations.value  = []
    employments.value = []
    tattoos.value     = []
    error.value       = null
  }

  return {
    // State
    lifestyle,
    educations,
    employments,
    tattoos,
    loading,
    submitting,
    error,

    // Lifestyle
    fetchLifestyle,
    upsertLifestyle,

    // Education
    fetchEducations,
    createEducation,
    updateEducation,
    deleteEducation,

    // Employment
    fetchEmployments,
    createEmployment,
    updateEmployment,
    deleteEmployment,

    // Tattoos
    fetchTattoos,
    createTattoo,
    updateTattoo,
    deleteTattoo,

    // Biodata
    uploadBiodata,

    // Utils
    fetchAllSubData,
    clearAll,
  }
})