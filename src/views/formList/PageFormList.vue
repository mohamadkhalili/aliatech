<template>
  <ui>
    <li v-for="(item, index) in formList?.data?.value?.data" :key="index">
      {{ item }}
    </li>
  </ui>
</template>

<script setup lang="ts">
import { useApi } from '@/composables/useApi';
import { getForms } from '../api/apAliatech';


const formList = useApi(getForms)

formList.exec({})
</script>
