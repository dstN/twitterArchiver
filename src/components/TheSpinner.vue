<template>
    <div v-if="isLoading" class="absolute left-0 top-0 z-10 opacity-100 flex min-h-screen min-w-full flex-col items-center justify-center gap-4 bg-white bg-opacity-30 font-sans">
      <div class="fixed top-0 right-0 z-50 flex h-screen w-screen items-center justify-center">
        <div class="h-32 w-32 animate-spin rounded-full border-t-2 border-b-2 border-blue-400"></div>
      </div>
    </div>
</template>

<script setup>
import { toRefs } from 'vue';

const props = defineProps({
    isLoading: {
        type: Boolean,
        required: true
    }
});

const { isLoading } = toRefs(props);
</script>