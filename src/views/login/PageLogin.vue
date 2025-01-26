<template>
  <form @submit="submit">
    <input v-model="email" placeholder="email" type="email" />
    <input v-model="password" placeholder="password" type="password" />
    <button type="submit">submit</button>
  </form>
</template>

<script setup lang="ts">
import { useApi } from '@/composables/useApi';
import { ref } from 'vue'
import { postLogin } from '../api/apAliatech';
import { useCookies } from '@vueuse/integrations/useCookies'
import { useRouter } from 'vue-router';

const email = ref('')
const password = ref('')

const cookies = useCookies()
const router = useRouter()
const loginApi = useApi(postLogin)

async function submit() {
  await loginApi.exec(email?.value, password?.value)
  if (loginApi?.statusSuccess && loginApi?.data?.value?.data) {
    cookies.set('access', loginApi?.data?.value?.data?.access)
    cookies.set('refresh', loginApi?.data?.value?.data?.refresh)
    router.push('/')
  }
}
</script>
