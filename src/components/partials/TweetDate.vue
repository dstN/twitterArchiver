<script setup>
import { toRefs, computed } from "vue";

const props = defineProps({
  tweetid: String,
  date: String,
});

const { date, tweetid } = toRefs(props);

const tweetDate = computed(() => {
  let returnDate = new Date(date.value);
  returnDate = returnDate.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return returnDate;
});

const tweetLink = computed(() => {
  let link;
  let prefix = "https://twitter.com/i/status/";
  link = prefix + tweetid.value;
  return link;
});
</script>

<template>
  <a
    :href="tweetLink"
    target="_blank"
  >
    <div
      :title="date"
      class="font-normal text-slate-700"
    >
      {{ tweetDate }}
    </div>
  </a>
</template>
