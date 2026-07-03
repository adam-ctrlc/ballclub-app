<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { PhCheckCircle, PhWarningCircle, PhPaperPlaneTilt } from '@phosphor-icons/vue'
import { getPublicSession, lookupByPhone, submitJoin } from '@/lib/api'
import { firstIssueMessage, joinSchema, phoneSchema } from '@/lib/validation'
import { debounce } from '@/lib/utils'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import NameFields from '@/components/ui/NameFields.vue'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const route = useRoute()
const shareCode = route.query.code

const status = ref('checking') // checking | form | success | error
const statusMessage = ref('')
const errorReason = ref('')

const firstName = ref('')
const middleName = ref('')
const lastName = ref('')
const phone = ref('')
const joinError = ref('')
const submitting = ref(false)
const lookupHint = ref('')

async function runLookup() {
  lookupHint.value = ''
  if (!phoneSchema.safeParse(phone.value).success) return
  try {
    const res = await lookupByPhone(phone.value)
    if (res?.found) {
      lookupHint.value = `Welcome back, ${res.name}!`
      if (!firstName.value && !middleName.value && !lastName.value) {
        firstName.value = res.first_name
        middleName.value = res.middle_name || ''
        lastName.value = res.last_name
      }
    }
  } catch {
    // ignore lookup failures; the form still works without autofill
  }
}

const debouncedLookup = debounce(runLookup, 400)

async function checkSession() {
  if (!shareCode) {
    status.value = 'error'
    errorReason.value = 'Invalid link. No session code provided.'
    return
  }

  try {
    const data = await getPublicSession(shareCode)
    statusMessage.value = `Session Status: ${data.status.toUpperCase()}`
    if (data.status === 'closed') {
      status.value = 'error'
      errorReason.value = 'This session has been closed.'
    } else {
      status.value = 'form'
    }
  } catch (err) {
    status.value = 'error'
    errorReason.value = 'This session link is expired or invalid.'
  }
}

async function handleSubmit() {
  joinError.value = ''
  const result = joinSchema.safeParse({
    firstName: firstName.value,
    middleName: middleName.value,
    lastName: lastName.value,
    phone: phone.value,
  })
  if (!result.success) {
    joinError.value = firstIssueMessage(result)
    return
  }

  submitting.value = true
  try {
    await submitJoin(shareCode, result.data, result.data.phone)
    status.value = 'success'
  } catch (err) {
    joinError.value = err.message || 'Failed to submit request. Please try again.'
  } finally {
    submitting.value = false
  }
}

onMounted(checkSession)
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center px-6 py-7">
    <div class="w-full max-w-sm">
      <Card>
        <CardHeader class="flex flex-col items-center gap-1 text-center">
          <img src="/logo.png" alt="MAB Sports" class="mx-auto mb-2 h-[100px] w-[100px] rounded-2xl object-contain shadow-lg shadow-black/30" />
          <CardTitle class="font-heading text-[19px] font-semibold tracking-wide">MAB SPORTS</CardTitle>
          <CardDescription class="text-[13px]">JOIN BALLCLUB SESSION</CardDescription>
        </CardHeader>

        <CardContent>
          <div v-if="statusMessage && status !== 'error'" class="mb-5 text-center text-[13px] text-muted-foreground">
            {{ statusMessage }}
          </div>

          <form v-if="status === 'form'" class="space-y-3" @submit.prevent="handleSubmit">
            <NameFields
              v-model:first-name="firstName"
              v-model:middle-name="middleName"
              v-model:last-name="lastName"
              id-prefix="join"
            />
            <div>
              <Label for="join-phone" class="sr-only">Phone Number</Label>
              <Input
                id="join-phone"
                v-model="phone"
                type="tel"
                name="phone"
                autocomplete="tel"
                placeholder="Phone Number"
                required
                @update:model-value="debouncedLookup"
              />
              <p v-if="lookupHint" class="mt-1.5 text-xs font-medium text-brand-paid">{{ lookupHint }}</p>
            </div>
            <Button type="submit" :disabled="submitting" class="h-auto w-full gap-2 py-3.5 text-[15px] font-semibold">
              <PhPaperPlaneTilt :size="18" weight="bold" />
              {{ submitting ? 'Sending...' : 'Request to Join' }}
            </Button>
            <ErrorMessage :message="joinError" />
          </form>

          <div v-else-if="status === 'success'" class="text-center">
            <div class="mx-auto my-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-paid text-white">
              <PhCheckCircle :size="32" weight="fill" />
            </div>
            <div class="text-[19px] font-semibold">Request Sent!</div>
            <div class="mt-2.5 text-[13px] text-muted-foreground">
              Wait for the owner to approve your request. You'll be added to the queue.
            </div>
            <Button class="mt-5 h-auto w-full py-3.5 text-[15px] font-semibold" @click="$router.go(0)">Done</Button>
          </div>

          <div v-else-if="status === 'error'" class="text-center">
            <div class="mx-auto my-5 flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
              <PhWarningCircle :size="32" weight="fill" />
            </div>
            <div class="text-[19px] font-semibold">Session Unavailable</div>
            <div class="mt-2.5 text-[13px] text-muted-foreground">{{ errorReason }}</div>
            <Button as-child class="mt-5 h-auto w-full py-3.5 text-[15px] font-semibold">
              <router-link :to="{ name: 'login' }">Go Home</router-link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
