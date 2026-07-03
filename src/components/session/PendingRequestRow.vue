<script setup>
import { PhCheck, PhX } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

defineProps({ request: { type: Object, required: true } })
const emit = defineEmits(['approve', 'decline'])
</script>

<template>
  <Card size="sm" class="shadow-sm shadow-black/10">
    <CardContent class="flex items-center justify-between gap-2.5">
      <div class="flex flex-1 items-center gap-2.5">
        <div>
          <div class="text-sm font-medium">{{ request.name }}</div>
          <div class="text-[11px] text-muted-foreground">{{ request.phone }}</div>
        </div>
      </div>
      <div class="flex gap-2">
        <Button size="sm" @click="emit('approve', request.id)">
          <PhCheck :size="13" weight="bold" />
          Approve
        </Button>
        <Button variant="outline" size="sm" @click="emit('decline', request.id)">
          <PhX :size="13" weight="bold" />
          Decline
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
