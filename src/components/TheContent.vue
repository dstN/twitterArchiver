<script setup>
import { toRefs } from "vue";

const props = defineProps({
  data: {},
});

const { data } = toRefs(props);
</script>

<template>
  <div>
    <h1>Hello</h1>
  </div>
</template>
