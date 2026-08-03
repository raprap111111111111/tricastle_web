<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { createRoleSchema, updateRoleSchema } from '../schemas/role.schema'
import type { Role, RoleDialogMode } from '../types'

// PrimeVue
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Message from 'primevue/message'

// ─────────────────────────────────────────────
const props = defineProps<{
  visible:     boolean
  mode:        RoleDialogMode
  role?:       Role | null
  submitting:  boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', payload: { name: string; description?: string | null }): void
}>()

// ─────────────────────────────────────────────
const isEdit = computed(() => props.mode === 'edit')

const schema = computed(() =>
  isEdit.value ? toTypedSchema(updateRoleSchema) : toTypedSchema(createRoleSchema)
)

const { defineField, handleSubmit, resetForm, errors } = useForm({
  validationSchema: schema,
})

const [name,        nameAttrs]        = defineField('name')
const [description, descriptionAttrs] = defineField('description')

// ─────────────────────────────────────────────
// Pre-fill on edit
// ─────────────────────────────────────────────
watch(
  () => props.visible,
  (open) => {
    if (open && isEdit.value && props.role) {
      name.value        = props.role.name
      description.value = props.role.description ?? ''
    } else if (open && !isEdit.value) {
      resetForm()
    }
  },
  { immediate: true }
)

// ─────────────────────────────────────────────
const onSubmit = handleSubmit((values) => {
  emit('submit', {
    name:        values.name!,
    description: values.description ?? null,
  })
})

function close() {
  emit('update:visible', false)
  resetForm()
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="close"
    :header="isEdit ? 'Edit Role' : 'Create New Role'"
    :style="{ width: '480px' }"
    modal
    :closable="!submitting"
  >
    <form @submit.prevent="onSubmit" class="flex flex-col gap-5 pt-2">

      <!-- Role Name -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-surface-700 dark:text-surface-200">
          Role Name <span class="text-red-500">*</span>
        </label>
        <InputText
          v-model="name"
          v-bind="nameAttrs"
          placeholder="e.g. HR Manager"
          :invalid="!!errors.name"
          class="w-full"
          :disabled="submitting"
        />
        <small v-if="errors.name" class="text-red-500 text-xs">
          {{ errors.name }}
        </small>
      </div>

      <!-- Description -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-surface-700 dark:text-surface-200">
          Description
        </label>
        <Textarea
          v-model="description"
          v-bind="descriptionAttrs"
          placeholder="Describe what this role can do..."
          rows="3"
          :invalid="!!errors.description"
          class="w-full"
          :disabled="submitting"
        />
        <small v-if="errors.description" class="text-red-500 text-xs">
          {{ errors.description }}
        </small>
      </div>

      <!-- System role warning on edit -->
      <Message
        v-if="isEdit && role?.is_system"
        severity="warn"
        :closable="false"
        class="text-sm"
      >
        This is a system role. Modifications may affect system behaviour.
      </Message>

    </form>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-3">
        <Button
          label="Cancel"
          severity="secondary"
          text
          @click="close"
          :disabled="submitting"
        />
        <Button
          :label="isEdit ? 'Save Changes' : 'Create Role'"
          icon="pi pi-check"
          :loading="submitting"
          @click="onSubmit"
        />
      </div>
    </template>
  </Dialog>
</template>