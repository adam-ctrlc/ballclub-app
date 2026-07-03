<script setup>
import { computed } from 'vue'
import { PhTrash } from '@phosphor-icons/vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

const props = defineProps({ session: { type: Object, required: true } })
const emit = defineEmits(['open', 'delete'])

const date = computed(() =>
  new Date(props.session.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
)
const paidCount = computed(() => props.session.queue.filter((p) => p.paid).length)
</script>

<template>
  <Card
    size="sm"
    class="cursor-pointer flex-row items-center justify-between transition hover:ring-primary/40"
    @click="emit('open', session._id)"
  >
    <CardContent class="flex w-full items-center justify-between">
      <div>
        <div v-if="session.title" class="text-[11px] font-medium text-muted-foreground">{{ session.title }}</div>
        <div class="text-sm font-medium">{{ date }}</div>
        <div class="mt-0.5 text-xs text-muted-foreground">
          {{ session.queue.length }} players &middot; {{ paidCount }} paid
          <template v-if="session.revenue > 0"> &middot; {{ formatCurrency(session.revenue) }}</template>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Badge :variant="session.status === 'open' ? 'default' : 'secondary'">
          {{ session.status }}
        </Badge>
        <Button
          v-if="session.status === 'closed'"
          variant="destructive"
          size="sm"
          @click.stop="emit('delete', session._id)"
        >
          <PhTrash :size="13" weight="bold" />
          Delete
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
