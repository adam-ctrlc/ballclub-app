<script setup>
import { ref } from 'vue'
import { PhLink, PhCopy, PhCheck } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const props = defineProps({ shareCode: { type: String, required: true } })

const copied = ref(false)
const link = `${window.location.origin}/join?code=${props.shareCode}`

function copy() {
  navigator.clipboard.writeText(link)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <Card size="sm" class="mb-3.5 bg-secondary shadow-sm shadow-black/10">
    <CardContent>
      <div class="mb-1.5 flex items-center gap-1.5 text-[10px] tracking-wide text-muted-foreground">
        <PhLink :size="12" />
        SHARE LINK FOR JOINERS
      </div>
      <div class="flex items-center gap-2">
        <span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-foreground/80">{{ link }}</span>
        <Button size="sm" @click="copy">
          <component :is="copied ? PhCheck : PhCopy" :size="13" weight="bold" />
          {{ copied ? 'Copied' : 'Copy' }}
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
