<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { PhSignIn, PhBasketball, PhUser, PhLockKey, PhEye, PhEyeSlash } from '@phosphor-icons/vue'
import { loginRequest } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const submitting = ref(false)

const auth = useAuth()
const router = useRouter()

async function handleSubmit() {
  error.value = ''
  submitting.value = true
  try {
    const { token } = await loginRequest(username.value, password.value)
    auth.login(token)
    router.push({ name: 'dashboard' })
  } catch (err) {
    error.value = err.message || 'Incorrect username or password'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-7">
    <div class="login-grid pointer-events-none absolute inset-0"></div>
    <div
      class="pointer-events-none absolute left-1/2 top-[38%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[130px]"
    ></div>
    <PhBasketball
      class="pointer-events-none absolute bottom-0 left-1/2 h-auto w-[125vw] max-w-none -translate-x-1/2 translate-y-1/2 text-primary/10 sm:w-[600px] lg:w-[880px]"
      weight="duotone"
    />
    <div class="relative w-full max-w-sm">
      <Card class="border-border/70 shadow-2xl shadow-black/40 backdrop-blur-sm">
        <CardHeader class="flex flex-col items-center gap-1 text-center">
          <img src="/logo.png" alt="MAB Sports" class="mx-auto mb-2 h-[100px] w-[100px] rounded-2xl object-contain shadow-lg shadow-black/30" />
          <CardTitle class="font-heading text-[19px] font-semibold tracking-wide">MAB SPORTS</CardTitle>
          <CardDescription class="text-[13px]">BALLCLUB &middot; OWNER SIGN IN</CardDescription>
        </CardHeader>

        <CardContent>
          <form class="space-y-3" @submit.prevent="handleSubmit">
            <div class="relative">
              <Label for="login-username" class="sr-only">Username</Label>
              <PhUser :size="17" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="login-username"
                v-model="username"
                type="text"
                name="username"
                autocomplete="username"
                placeholder="Username"
                class="pl-9"
              />
            </div>
            <div class="relative">
              <Label for="login-password" class="sr-only">Password</Label>
              <PhLockKey :size="17" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="login-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                autocomplete="current-password"
                placeholder="Password"
                class="px-9"
              />
              <button
                type="button"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <component :is="showPassword ? PhEyeSlash : PhEye" :size="17" />
              </button>
            </div>
            <Button type="submit" :disabled="submitting" class="h-auto w-full gap-2 py-3.5 text-[15px] font-semibold">
              <PhSignIn :size="18" weight="bold" />
              {{ submitting ? 'Logging in...' : 'Log In' }}
            </Button>
          </form>

          <ErrorMessage :message="error" class="mt-2.5" />
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.login-grid {
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 46px 46px;
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, #000 35%, transparent 100%);
  mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, #000 35%, transparent 100%);
}
</style>
