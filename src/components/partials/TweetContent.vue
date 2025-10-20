<script setup>
import { ref, onMounted, onUpdated } from "vue";
import twemoji from "twemoji";

const props = defineProps({
  text: String,
  hasMedia: Boolean,
});

const tweetTextRef = ref(null);

function parseTwemoji() {
  if (tweetTextRef.value) {
    twemoji.parse(tweetTextRef.value, {
      folder: "svg",
      ext: ".svg",
    });
  }
}

onMounted(() => {
  parseTwemoji();
});

onUpdated(() => {
  parseTwemoji();
});
</script>

<template>
  <!-- Tweet Content -->
  <div class="tweet">
    <p
      ref="tweetTextRef"
      v-html="text"
      class="tweet-text break-words text-base text-gray-700 dark:text-gray-300"
      :class="{ 'mb-3': hasMedia }"
    ></p>
  </div>
</template>

<style scoped>
/* Twemoji styling */
.tweet-text :deep(img.emoji) {
  display: inline;
  height: 1.2em;
  width: 1.2em;
  margin: 0 0.05em 0 0.1em;
  vertical-align: -0.1em;
}
</style>
