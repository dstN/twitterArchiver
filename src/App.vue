<script setup>
import { ref } from "vue";
const loading = ref(false);
const data = ref(null);
function changeLoading() {
  console.log("I was called FOR REAL");
  loading.value = true;
}
</script>

<template>
  <div class="relative">
    <TheSpinner :isLoading="loading" />
    <TheContent v-if="data" />
    <TheDropzone :isLoading="loading" @load="changeLoading" v-else />
  </div>
</template>

<style scoped></style>
