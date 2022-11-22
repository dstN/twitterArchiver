<script setup>
import { toRefs, computed } from "vue";

const props = defineProps({
  id: String,
  dateStr: String,
});

const { dateStr, id } = toRefs(props);

const formattedDate = computed(() => {
  const date = new Date(dateStr.value);
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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
      :title="dateStr"
      class="font-normal text-slate-700"
    >
      {{ formattedDate }}
    </div>
  </a>
</template>
