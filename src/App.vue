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
  account.value = payload.account[0];
  profile.value = payload.profile[0];
}
</script>

<template>
  <div class="relative bg-slate-300">
    <TheSpinner v-if="loading" />
    <TheContent
      :items="tweets"
      :account="account"
      :profile="profile"
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
