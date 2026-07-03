<script setup>
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

defineProps({ isOpen: { type: Boolean, required: true }, title: { type: String, required: true } })
const emit = defineEmits(['close'])

function handleOpenChange(value) {
  if (!value) emit('close')
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
      </DialogHeader>
      <slot />
    </DialogContent>
  </Dialog>
</template>
