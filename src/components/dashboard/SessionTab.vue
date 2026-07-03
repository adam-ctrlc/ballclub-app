<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PhPlus, PhX, PhUsersThree, PhMagnifyingGlass, PhArrowLeft, PhNotePencil, PhDownloadSimple } from '@phosphor-icons/vue'
import {
  addWalkin,
  approveRequest,
  closeSession,
  createSession,
  declineRequest,
  deletePlayer,
  exportSessionCsv,
  getSession,
  listSessions,
  setSessionFee,
  togglePlayerPaid,
  updateSession,
} from '@/lib/api'
import ShareLinkBox from '@/components/session/ShareLinkBox.vue'
import PendingRequestRow from '@/components/session/PendingRequestRow.vue'
import PlayerRow from '@/components/session/PlayerRow.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import NameFields from '@/components/ui/NameFields.vue'
import Modal from '@/components/ui/Modal.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import SkeletonRow from '@/components/ui/SkeletonRow.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { feeSchema, firstIssueMessage, sessionMetaSchema, walkinSchema } from '@/lib/validation'
import { useConfirm } from '@/composables/useConfirm'
import { debounce, formatCurrency } from '@/lib/utils'
import { Input } from '@/components/ui/input'

const route = useRoute()
const router = useRouter()
const { confirm } = useConfirm()

const session = ref(null)
const search = ref('')
const walkinFirstName = ref('')
const walkinMiddleName = ref('')
const walkinLastName = ref('')
const error = ref('')
const loading = ref(true)
const isWalkinModalOpen = ref(false)

const isDetailsModalOpen = ref(false)
const detailsTitle = ref('')
const detailsLocation = ref('')
const detailsNotes = ref('')
const detailsCapacity = ref('')
const detailsFee = ref('')
const detailsError = ref('')
const savingDetails = ref(false)

const paidCount = computed(() => (session.value ? session.value.queue.filter((p) => p.paid).length : 0))
const collected = computed(() => paidCount.value * (session.value?.fee ?? 0))
const isFull = computed(
  () => session.value?.capacity != null && session.value.queue.length >= session.value.capacity
)

function resetWalkinForm() {
  walkinFirstName.value = ''
  walkinMiddleName.value = ''
  walkinLastName.value = ''
  error.value = ''
}

function openWalkinModal() {
  resetWalkinForm()
  isWalkinModalOpen.value = true
}

function closeWalkinModal() {
  isWalkinModalOpen.value = false
}

function openDetailsModal() {
  detailsTitle.value = session.value.title || ''
  detailsLocation.value = session.value.location || ''
  detailsNotes.value = session.value.notes || ''
  detailsCapacity.value = session.value.capacity != null ? String(session.value.capacity) : ''
  detailsFee.value = String(session.value.fee ?? 0)
  detailsError.value = ''
  isDetailsModalOpen.value = true
}

function closeDetailsModal() {
  isDetailsModalOpen.value = false
}

async function handleSaveDetails() {
  detailsError.value = ''
  const meta = sessionMetaSchema.safeParse({
    title: detailsTitle.value,
    notes: detailsNotes.value,
    location: detailsLocation.value,
    capacity: detailsCapacity.value,
  })
  if (!meta.success) {
    detailsError.value = firstIssueMessage(meta)
    return
  }
  const fee = feeSchema.safeParse(detailsFee.value)
  if (!fee.success) {
    detailsError.value = firstIssueMessage(fee)
    return
  }

  savingDetails.value = true
  try {
    await updateSession(session.value._id, {
      title: meta.data.title,
      notes: meta.data.notes,
      location: meta.data.location,
      capacity: meta.data.capacity === '' ? null : meta.data.capacity,
    })
    if (fee.data !== (session.value.fee ?? 0)) {
      await setSessionFee(session.value._id, fee.data)
    }
    isDetailsModalOpen.value = false
    await refresh()
  } catch (err) {
    detailsError.value = err.message || 'Failed to save details'
  } finally {
    savingDetails.value = false
  }
}

async function load() {
  loading.value = true
  try {
    if (route.query.sessionId) {
      session.value = await getSession(route.query.sessionId, search.value)
      return
    }
    const res = await listSessions({ status: 'open', pageSize: 1 })
    session.value = res.items[0] ?? null
  } finally {
    loading.value = false
  }
}

async function refresh() {
  if (!session.value) return
  session.value = await getSession(session.value._id, search.value)
}

const debouncedRefresh = debounce(refresh, 300)

async function withErrorHandling(action) {
  error.value = ''
  try {
    await action()
  } catch (err) {
    error.value = err.message || 'Something went wrong'
  }
}

function handleStart() {
  return withErrorHandling(async () => {
    session.value = await createSession()
    router.replace({ name: 'session' })
  })
}

function goToHistory() {
  router.push({ name: 'history' })
}

function handleExport() {
  return withErrorHandling(async () => {
    await exportSessionCsv(session.value._id)
  })
}

async function handleClose() {
  const ok = await confirm({
    title: 'Close session?',
    message: 'No more players can be added once closed.',
    confirmText: 'Close',
    danger: true,
  })
  if (!ok) return
  return withErrorHandling(async () => {
    await closeSession(session.value._id)
    session.value = null
    router.push({ name: 'history' })
  })
}

function handleAddWalkin() {
  const result = walkinSchema.safeParse({
    firstName: walkinFirstName.value,
    middleName: walkinMiddleName.value,
    lastName: walkinLastName.value,
    phone: '',
  })
  if (!result.success) {
    error.value = firstIssueMessage(result)
    return
  }
  return withErrorHandling(async () => {
    await addWalkin(session.value._id, result.data, '')
    resetWalkinForm()
    isWalkinModalOpen.value = false
    await refresh()
  })
}

function handleApprove(requestId) {
  return withErrorHandling(async () => {
    await approveRequest(session.value._id, requestId)
    await refresh()
  })
}

function handleDecline(requestId) {
  return withErrorHandling(async () => {
    await declineRequest(session.value._id, requestId)
    await refresh()
  })
}

function handleTogglePaid(playerId) {
  return withErrorHandling(async () => {
    await togglePlayerPaid(session.value._id, playerId)
    await refresh()
  })
}

async function handleDeletePlayer(playerId) {
  const ok = await confirm({
    title: 'Remove player?',
    message: 'This will remove them from the queue.',
    confirmText: 'Remove',
    danger: true,
  })
  if (!ok) return
  return withErrorHandling(async () => {
    await deletePlayer(session.value._id, playerId)
    await refresh()
  })
}

onMounted(load)
</script>

<template>
  <div>
    <div v-if="loading" class="space-y-2">
      <Skeleton class="h-12 w-full" />
      <Skeleton class="h-16 w-full" />
      <SkeletonRow v-for="i in 2" :key="i" />
    </div>

    <template v-else>
    <div v-if="!session" class="flex min-h-[60vh] flex-col items-center justify-center">
      <div class="flex w-full max-w-sm flex-col items-center gap-3">
        <Button
          class="h-auto w-full gap-2 py-3.5 text-[15px] font-semibold shadow-lg shadow-primary/20"
          @click="handleStart"
        >
          <PhUsersThree :size="18" weight="bold" />
          Start New Session
        </Button>
        <ErrorMessage :message="error" />
        <EmptyState message='No active session. Click "Start New Session" to begin.' />
      </div>
    </div>

    <div v-else>
      <button
        type="button"
        class="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        @click="goToHistory"
      >
        <PhArrowLeft :size="15" weight="bold" />
        All sessions
      </button>

      <div class="mb-3.5 flex flex-wrap items-center justify-between gap-2">
        <span class="text-sm font-medium">
          {{ new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }}
          &middot; {{ session.status }}
        </span>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" :disabled="session.queue.length === 0" @click="handleExport">
            <PhDownloadSimple :size="14" weight="bold" />
            Export CSV
          </Button>
          <Button v-if="session.status !== 'closed'" variant="outline" size="sm" @click="handleClose">
            <PhX :size="14" weight="bold" />
            Close Session
          </Button>
        </div>
      </div>

      <Card size="sm" class="mb-3.5">
        <CardContent class="flex flex-col gap-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="text-sm font-semibold">{{ session.title || 'Untitled session' }}</div>
              <div v-if="session.location" class="mt-0.5 text-xs text-muted-foreground">{{ session.location }}</div>
            </div>
            <Button v-if="session.status !== 'closed'" variant="outline" size="sm" @click="openDetailsModal">
              <PhNotePencil :size="13" weight="bold" />
              Edit
            </Button>
          </div>
          <p v-if="session.notes" class="whitespace-pre-line text-xs text-muted-foreground">{{ session.notes }}</p>
          <div class="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
            <div>
              <span class="text-muted-foreground">Fee </span>
              <span class="font-medium">{{ formatCurrency(session.fee) }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Collected </span>
              <span class="font-medium">{{ formatCurrency(collected) }}</span>
              <span class="text-muted-foreground"> ({{ paidCount }}/{{ session.queue.length }} paid)</span>
            </div>
            <div>
              <span class="text-muted-foreground">Capacity </span>
              <span class="font-medium">
                {{ session.capacity != null ? `${session.queue.length}/${session.capacity}` : 'Unlimited' }}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ShareLinkBox :share-code="session.share_code" />

      <div class="relative mb-3.5">
        <PhMagnifyingGlass :size="15" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="search" placeholder="Search players and requests by name" class="pl-8" @update:model-value="debouncedRefresh" />
      </div>

      <template v-if="session.pending.length">
        <div class="mb-2 text-[11px] tracking-wide text-muted-foreground">PENDING REQUESTS</div>
        <div class="mb-3.5 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          <PendingRequestRow
            v-for="request in session.pending"
            :key="request.id"
            :request="request"
            @approve="handleApprove"
            @decline="handleDecline"
          />
        </div>
      </template>

      <div class="mb-2 mt-3.5 flex items-center justify-between">
        <div class="text-[11px] tracking-wide text-muted-foreground">PLAYERS IN QUEUE</div>
        <Button size="sm" :disabled="isFull" @click="openWalkinModal">
          <PhPlus :size="14" weight="bold" />
          {{ isFull ? 'Session full' : 'Add Walk-in' }}
        </Button>
      </div>

      <Modal :is-open="isWalkinModalOpen" title="Add Walk-in" @close="closeWalkinModal">
        <NameFields
          v-model:first-name="walkinFirstName"
          v-model:middle-name="walkinMiddleName"
          v-model:last-name="walkinLastName"
          id-prefix="walkin"
          class="mb-3"
          @keyup.enter="handleAddWalkin"
        />
        <ErrorMessage :message="error" class="mb-3" />
        <Button class="w-full" @click="handleAddWalkin">
          <PhPlus :size="16" weight="bold" />
          Add
        </Button>
      </Modal>

      <Modal :is-open="isDetailsModalOpen" title="Session details" @close="closeDetailsModal">
        <div class="flex flex-col gap-2">
          <Label for="session-title" class="sr-only">Title</Label>
          <Input id="session-title" v-model="detailsTitle" placeholder="Title (optional)" />
          <Label for="session-location" class="sr-only">Location</Label>
          <Input id="session-location" v-model="detailsLocation" placeholder="Location (optional)" />
          <div class="flex gap-2">
            <div class="flex-1">
              <Label for="session-fee" class="mb-1 block text-[11px] tracking-wide text-muted-foreground">FEE PER PLAYER</Label>
              <Input id="session-fee" v-model="detailsFee" type="number" min="0" step="any" placeholder="0" />
            </div>
            <div class="flex-1">
              <Label for="session-capacity" class="mb-1 block text-[11px] tracking-wide text-muted-foreground">CAPACITY</Label>
              <Input id="session-capacity" v-model="detailsCapacity" type="number" min="1" placeholder="Unlimited" />
            </div>
          </div>
          <Label for="session-notes" class="sr-only">Notes</Label>
          <textarea
            id="session-notes"
            v-model="detailsNotes"
            rows="3"
            placeholder="Notes (optional)"
            class="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <ErrorMessage :message="detailsError" />
          <Button class="w-full" :disabled="savingDetails" @click="handleSaveDetails">
            {{ savingDetails ? 'Saving...' : 'Save Details' }}
          </Button>
        </div>
      </Modal>

      <EmptyState
        v-if="session.queue.length === 0"
        :message="search ? 'No players match your search.' : 'No approved players yet.'"
      />
      <div v-else class="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        <PlayerRow
          v-for="player in session.queue"
          :key="player.id"
          :player="player"
          @toggle-paid="handleTogglePaid"
          @delete="handleDeletePlayer"
        />
      </div>
    </div>
    </template>
  </div>
</template>
