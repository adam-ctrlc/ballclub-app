<script setup>
import { PhCheck, PhTrash } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

defineProps({ player: { type: Object, required: true } })
const emit = defineEmits(['toggle-paid', 'delete'])
</script>

<template>
  <Card size="sm" class="shadow-sm shadow-black/10">
    <CardContent class="flex items-center justify-between gap-2.5">
      <div class="flex flex-1 items-center gap-2.5">
        <div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
          {{ player.queue_number }}
        </div>
        <div class="text-sm font-medium">{{ player.name }}</div>
      </div>
      <div class="flex gap-2">
        <Button
          size="sm"
          class="min-w-16 rounded-full text-[11px] font-semibold text-white"
          :class="player.paid ? 'bg-brand-paid hover:bg-brand-paid/90' : 'bg-primary hover:bg-primary/80'"
          @click="emit('toggle-paid', player.id)"
        >
          <PhCheck v-if="player.paid" :size="12" weight="bold" />
          {{ player.paid ? 'Paid' : 'Unpaid' }}
        </Button>
        <Button variant="destructive" size="sm" @click="emit('delete', player.id)">
          <PhTrash :size="13" weight="bold" />
          Delete
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
