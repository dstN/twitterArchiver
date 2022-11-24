<script setup>
import { toRefs, computed } from "vue";

const props = defineProps({
  id: String,
  date: Date,
});

const { date, id } = toRefs(props);

const formattedDate = computed(() => {
  return date.value.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

const link = computed(() => {
  return `https://twitter.com/i/status/${id.value}`;
});
</script>

<template>
  <a
    :href="link"
    target="_blank"
  >
    <div
      :title="date"
      class="font-normal text-slate-700"
    >
      {{ formattedDate }}
    </div>
  </a>
</template>
