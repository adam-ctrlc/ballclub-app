<script setup>
import { PhWarning } from '@phosphor-icons/vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/composables/useConfirm'

const { isOpen, options, handleConfirm, handleCancel } = useConfirm()

function handleOpenChange(value) {
  if (!value) handleCancel()
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent>
      <DialogHeader>
        <div class="flex items-center gap-2.5">
          <div
            class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
            :class="options.danger ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-muted-foreground'"
          >
            <PhWarning :size="18" weight="bold" />
          </div>
          <DialogTitle>{{ options.title }}</DialogTitle>
        </div>
      </DialogHeader>
      <p class="text-sm text-muted-foreground">{{ options.message }}</p>
      <DialogFooter>
        <Button variant="outline" @click="handleCancel">{{ options.cancelText }}</Button>
        <Button :variant="options.danger ? 'destructive' : 'default'" @click="handleConfirm">
          {{ options.confirmText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
