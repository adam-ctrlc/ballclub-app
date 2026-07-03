<script setup>
import { computed } from 'vue'
import { PhCaretLeft, PhCaretRight } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'

const props = defineProps({
  page: { type: Number, required: true },
  pageSize: { type: Number, required: true },
  total: { type: Number, required: true },
})
const emit = defineEmits(['update:page'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const canPrev = computed(() => props.page > 1)
const canNext = computed(() => props.page < totalPages.value)

function prev() {
  if (canPrev.value) emit('update:page', props.page - 1)
}
function next() {
  if (canNext.value) emit('update:page', props.page + 1)
}
</script>

<template>
  <div v-if="totalPages > 1" class="mt-4 flex items-center justify-center gap-3">
    <Button variant="outline" size="sm" :disabled="!canPrev" @click="prev">
      <PhCaretLeft :size="14" weight="bold" />
      Prev
    </Button>
    <span class="text-xs text-muted-foreground">Page {{ page }} of {{ totalPages }}</span>
    <Button variant="outline" size="sm" :disabled="!canNext" @click="next">
      Next
      <PhCaretRight :size="14" weight="bold" />
    </Button>
  </div>
</template>
