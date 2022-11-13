<script setup>
import { ref } from "vue";

const loading = ref(false);
const data = ref(null);

function changeLoading() {
  loading.value = true;
}
</script>

<template>
  <div class="relative">
    <TheSpinner v-if="loading" />
    <TheContent v-if="data" />
    <TheDropzone
      :isLoading="loading"
      @load="changeLoading"
      v-else
    />
  </div>
</template>
