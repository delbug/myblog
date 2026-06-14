<template>
  <form class="space-y-4" @submit.prevent="emit('submit', form)">
    <div v-for="field in schema" :key="field.key" :class="field.fullWidth ? 'col-span-2' : ''">
      <label class="mb-1 block text-sm">{{ field.label }}<span v-if="field.required" class="text-red-500">*</span></label>

      <input
        v-if="field.type === 'text' || field.type === 'email' || field.type === 'number'"
        v-model="form[field.key]"
        :type="field.type"
        class="input"
        :required="field.required"
        :placeholder="field.placeholder"
      />

      <textarea
        v-else-if="field.type === 'textarea'"
        v-model="form[field.key]"
        class="input min-h-[100px]"
        :required="field.required"
        :placeholder="field.placeholder"
      />

      <select v-else-if="field.type === 'select'" v-model="form[field.key]" class="input">
        <option v-for="opt in field.options" :key="String(opt.value)" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>

    <div class="flex gap-3">
      <button type="submit" class="btn-primary">{{ submitText }}</button>
      <slot name="extra" />
    </div>
  </form>
</template>

<script setup lang="ts">
/** Schema 驱动表单 */
export interface FormField {
  key: string
  label: string
  type: 'text' | 'email' | 'number' | 'textarea' | 'select'
  required?: boolean
  placeholder?: string
  fullWidth?: boolean
  options?: Array<{ label: string; value: string | number | null }>
}

const props = withDefaults(defineProps<{
  schema: FormField[]
  modelValue?: Record<string, unknown>
  submitText?: string
}>(), { submitText: '提交' })

const emit = defineEmits<{ submit: [data: Record<string, unknown>]; 'update:modelValue': [data: Record<string, unknown>] }>()

const form = reactive<Record<string, unknown>>({ ...props.modelValue })

watch(form, (v) => emit('update:modelValue', { ...v }), { deep: true })
</script>
