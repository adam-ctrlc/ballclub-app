import { ref } from 'vue'

const isOpen = ref(false)
const options = ref({ title: 'Are you sure?', message: '', confirmText: 'Confirm', cancelText: 'Cancel', danger: false })
let resolvePromise = null

function confirm(opts) {
  options.value = { title: 'Are you sure?', confirmText: 'Confirm', cancelText: 'Cancel', danger: false, ...opts }
  isOpen.value = true
  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

function handleConfirm() {
  isOpen.value = false
  resolvePromise?.(true)
}

function handleCancel() {
  isOpen.value = false
  resolvePromise?.(false)
}

export function useConfirm() {
  return { isOpen, options, confirm, handleConfirm, handleCancel }
}
