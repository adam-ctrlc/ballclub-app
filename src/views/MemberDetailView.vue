<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PhArrowLeft, PhPencilSimple, PhCoins, PhCheckCircle, PhCalendarCheck } from '@phosphor-icons/vue'
import { getMemberHistory, updateMember } from '@/lib/api'
import { firstIssueMessage, memberSchema } from '@/lib/validation'
import { formatCurrency } from '@/lib/utils'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import NameFields from '@/components/ui/NameFields.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'

const route = useRoute()
const router = useRouter()

const member = ref(null)
const loading = ref(true)

const isEditing = ref(false)
const editFirstName = ref('')
const editMiddleName = ref('')
const editLastName = ref('')
const editPhone = ref('')
const error = ref('')
const saving = ref(false)

function syncEditFields() {
  editFirstName.value = member.value.first_name
  editMiddleName.value = member.value.middle_name || ''
  editLastName.value = member.value.last_name
  editPhone.value = member.value.phone || ''
}

async function load() {
  loading.value = true
  try {
    member.value = await getMemberHistory(route.params.id)
    syncEditFields()
  } finally {
    loading.value = false
  }
}

function startEditing() {
  error.value = ''
  isEditing.value = true
}

function cancelEditing() {
  syncEditFields()
  error.value = ''
  isEditing.value = false
}

async function handleSave() {
  error.value = ''
  const result = memberSchema.safeParse({
    firstName: editFirstName.value,
    middleName: editMiddleName.value,
    lastName: editLastName.value,
    phone: editPhone.value,
  })
  if (!result.success) {
    error.value = firstIssueMessage(result)
    return
  }

  saving.value = true
  try {
    await updateMember(route.params.id, {
      first_name: result.data.firstName,
      middle_name: result.data.middleName || '',
      last_name: result.data.lastName,
      phone: result.data.phone || '',
    })
    isEditing.value = false
    await load()
  } catch (err) {
    error.value = err.message || 'Failed to save changes'
  } finally {
    saving.value = false
  }
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(load)
</script>

<template>
  <div>
    <button
      type="button"
      class="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      @click="router.push({ name: 'members' })"
    >
      <PhArrowLeft :size="15" weight="bold" />
      All members
    </button>

    <div v-if="loading" class="space-y-3">
      <Skeleton class="h-40 w-full" />
      <Skeleton class="h-24 w-full" />
    </div>

    <template v-else>
      <Card size="sm" class="mb-4">
        <CardHeader>
          <CardTitle class="text-[11px] tracking-wide text-muted-foreground">MEMBER INFO</CardTitle>
          <CardAction v-if="!isEditing">
            <Button variant="outline" size="sm" @click="startEditing">
              <PhPencilSimple :size="13" weight="bold" />
              Edit
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div v-if="!isEditing">
            <div class="font-heading text-xl font-semibold">{{ member.full_name }}</div>
            <div class="mt-1 text-sm text-muted-foreground">{{ member.phone || 'No phone' }}</div>
            <div class="mt-1 text-xs text-muted-foreground">Joined {{ formatDate(member.date_joined) }}</div>
          </div>
          <form v-else class="flex flex-col gap-2" @submit.prevent="handleSave">
            <NameFields
              v-model:first-name="editFirstName"
              v-model:middle-name="editMiddleName"
              v-model:last-name="editLastName"
              id-prefix="member-detail"
            />
            <Label for="member-detail-phone" class="sr-only">Phone</Label>
            <Input id="member-detail-phone" v-model="editPhone" type="tel" autocomplete="tel" placeholder="Phone" />
            <ErrorMessage :message="error" />
            <div class="mt-1 flex gap-2">
              <Button type="button" variant="outline" class="flex-1" @click="cancelEditing">Cancel</Button>
              <Button type="submit" class="flex-1" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div class="mb-4 grid grid-cols-3 gap-3">
        <Card size="sm">
          <CardContent>
            <PhCalendarCheck :size="18" class="mb-2 text-primary" weight="bold" />
            <div class="text-2xl font-semibold">{{ member.total_sessions }}</div>
            <div class="text-xs text-muted-foreground">Sessions played</div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent>
            <PhCheckCircle :size="18" class="mb-2 text-primary" weight="bold" />
            <div class="text-2xl font-semibold">{{ member.total_paid }}</div>
            <div class="text-xs text-muted-foreground">Times paid</div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent>
            <PhCoins :size="18" class="mb-2 text-primary" weight="bold" />
            <div class="text-2xl font-semibold">{{ formatCurrency(member.total_spent) }}</div>
            <div class="text-xs text-muted-foreground">Total spent</div>
          </CardContent>
        </Card>
      </div>

      <div class="mb-2 text-[11px] tracking-wide text-muted-foreground">ATTENDANCE HISTORY</div>
      <EmptyState v-if="member.sessions.length === 0" message="This member hasn't joined any sessions yet." />
      <div v-else class="flex flex-col gap-2">
        <Card v-for="entry in member.sessions" :key="entry.session_id" size="sm" class="flex-row items-center">
          <CardContent class="flex w-full items-center justify-between gap-2">
            <div>
              <div class="text-sm font-medium">{{ entry.title || formatDate(entry.date) }}</div>
              <div v-if="entry.title" class="text-[11px] text-muted-foreground">{{ formatDate(entry.date) }}</div>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="entry.amount > 0" class="text-sm font-medium">{{ formatCurrency(entry.amount) }}</span>
              <Badge :variant="entry.paid ? 'default' : 'secondary'">{{ entry.paid ? 'Paid' : 'Unpaid' }}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>
  </div>
</template>
