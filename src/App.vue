<script setup>
import { ref } from "vue";

const loading = ref(false);
const data = ref(null);
const tweets = ref(null);
const account = ref(null);
const profile = ref(null);

function changeLoading(loadValue) {
  loading.value = loadValue;
}

function handleData(payload) {
  data.value = payload;
  tweets.value = payload.tweets;
  console.log("HandleData: ", tweets.value);
}
</script>

<template>
  <div class="relative">
    <TheSpinner v-if="loading" />
    <TheContent
      :items="tweets"
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
