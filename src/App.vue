<script setup>
import { ref } from "vue";

const loading = ref(false);
const data = ref(null);

function changeLoading(loadValue) {
  loading.value = loadValue;
}

function handleData(payload) {
  data.value = payload;
}
</script>

<template>
  <div class="relative bg-slate-300">
    <TheSpinner v-if="loading" />
    <TheContent
      :items="data.tweets"
      :account="data.account"
      :profile="data.profile"
      v-if="data"
    />
    <TheDropzone
      :isLoading="loading"
      @load="changeLoading"
      @payloadEvent="handleData"
      v-else
    />
  </div>
</template>
