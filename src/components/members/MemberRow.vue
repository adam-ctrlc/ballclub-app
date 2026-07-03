<script setup>
import { PhTrash } from '@phosphor-icons/vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const props = defineProps({ member: { type: Object, required: true } })
const emit = defineEmits(['delete', 'open'])

const initials = `${props.member.first_name[0]}${props.member.last_name[0]}`.toUpperCase()
</script>

<template>
  <Card
    size="sm"
    class="cursor-pointer flex-row items-center transition hover:ring-primary/40"
    @click="emit('open', member._id)"
  >
    <CardContent class="flex w-full items-center gap-2.5">
      <div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
        {{ initials }}
      </div>
      <div class="flex-1">
        <div class="text-sm font-medium">{{ member.full_name }}</div>
        <div class="text-[11px] text-muted-foreground">{{ member.phone || 'No phone' }}</div>
      </div>
      <Button variant="destructive" size="sm" @click.stop="emit('delete', member._id)">
        <PhTrash :size="13" weight="bold" />
        Delete
      </Button>
    </CardContent>
  </Card>
</template>
