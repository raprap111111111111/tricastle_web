<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import {
  createPermissionSchema,
  updatePermissionSchema,
} from '../schemas/permission.schema'
import type { Permission, PermissionDialogMode } from '../types'

// PrimeVue
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Message from 'primevue/message'

// ─────────────────────────────────────────────
const props = defineProps<{
  visible:    boolean
  mode:       PermissionDialogMode
  permission?: Permission | null
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', payload: { name: string; description?: string | null; module?: string | null }): void
}>()

// ─────────────────────────────────────────────
const isEdit = computed(() => props.mode === 'edit')

const schema = computed(() =>
  isEdit.value
    ? toTypedSchema(updatePermissionSchema)
    : toTypedSchema(createPermissionSchema)
)

const { defineField, handleSubmit, resetForm, errors } = useForm({
  validationSchema: schema,
})

const [name,        nameAttrs]        = defineField('name')
const [description, descriptionAttrs] = defineField('description')
const [moduleField, moduleAttrs]      = defineField('module')

// Auto-derive module from name
watch(name, (newName) => {
  if (!newName || isEdit.value) return
  const parts = newName.split('.')
  if (parts.length === 2 && parts[0]) {
    moduleField.value = parts[0]
  }
})

// ─────────────────────────────────────────────
watch(
  () => props.visible,
  (open) => {
    if (open && isEdit.value && props.permission) {
      name.value        = props.permission.name
      description.value = props.permission.description ?? ''
      moduleField.value = props.permission.module ?? ''
    } else if (open && !isEdit.value) {
      resetForm()
    }
  },
  { immediate: true }
)

const onSubmit = handleSubmit((values) => {
  emit('submit', {
    name:        values.name!,
    description: values.description ?? null,
    module:      values.module ?? null,
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
    :header="isEdit ? 'Edit Permission' : 'Create New Permission'"
    :style="{ width: '480px' }"
    modal
    :closable="!submitting"
  >
    <form @submit.prevent="onSubmit" class="flex flex-col gap-5 pt-2">

      <!-- Name -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-surface-700 dark:text-surface-200">
          Permission Name <span class="text-red-500">*</span>
        </label>
        <InputText
          v-model="name"
          v-bind="nameAttrs"
          placeholder="e.g. applicant.viewAny"
          :invalid="!!errors.name"
          class="w-full font-mono"
          :disabled="submitting"
        />
        <small v-if="errors.name" class="text-red-500 text-xs">
          {{ errors.name }}
        </small>
        <small v-else class="text-surface-500 text-xs">
          Use dot notation: <code class="font-mono">module.action</code>
        </small>
      </div>

      <!-- Module -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-surface-700 dark:text-surface-200">
          Module
        </label>
        <InputText
          v-model="moduleField"
          v-bind="moduleAttrs"
          placeholder="Auto-derived from name"
          :invalid="!!errors.module"
          class="w-full"
          :disabled="submitting"
        />
        <small v-if="errors.module" class="text-red-500 text-xs">
          {{ errors.module }}
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
          placeholder="Describe what this permission grants..."
          rows="3"
          :invalid="!!errors.description"
          class="w-full"
          :disabled="submitting"
        />
        <small v-if="errors.description" class="text-red-500 text-xs">
          {{ errors.description }}
        </small>
      </div>

      <!-- Info message -->
      <Message
        v-if="!isEdit"
        severity="info"
        :closable="false"
        class="text-sm"
      >
        Creating a new permission won't automatically assign it to any role.
        You'll need to assign it manually via the Roles page.
      </Message>

    </form>

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
          :label="isEdit ? 'Save Changes' : 'Create Permission'"
          icon="pi pi-check"
          :loading="submitting"
          @click="onSubmit"
        />
      </div>
    </template>
  </Dialog>
</template>