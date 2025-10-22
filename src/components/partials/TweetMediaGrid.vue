<script setup>
import { computed, onMounted, watch, nextTick } from "vue";

const props = defineProps({
  media: Array,
});

const emit = defineEmits(["openLightbox"]);

const mediaGridClass = computed(() => {
  if (!props.media?.length) return "";

  const count = props.media.length;

  // Twitter-like grid layouts (max 4 media per tweet)
  switch (count) {
    case 1:
      return "media-grid-single";
    case 2:
      return "media-grid-two";
    case 3:
      return "media-grid-three";
    default: // 4 or more (shouldn't be more than 4 on Twitter)
      return "media-grid-four";
  }
});

async function openLightbox(media, index) {
  if (!media) return;

  if (!media.data && typeof media.ensureDataUrl === "function") {
    await ensureMediaLoaded(media);
  }

  if (!media.data) {
    console.error("Invalid media:", media);
    return;
  }
  emit("openLightbox", media, index);
}

async function ensureMediaLoaded(item) {
  if (!item) return;
  if (item.data) return;
  if (item._loading) return;
  if (typeof item.ensureDataUrl !== "function") return;

  item._loading = true;
  try {
    await item.ensureDataUrl();
  } catch (error) {
    console.warn("Failed to hydrate media entry", error);
  } finally {
    item._loading = false;
  }
}

function loadVisibleMedia() {
  if (!Array.isArray(props.media)) return;
  props.media.forEach((item) => ensureMediaLoaded(item));
}

onMounted(async () => {
  await nextTick();
  loadVisibleMedia();
});

watch(
  () => props.media,
  () => {
    loadVisibleMedia();
  },
  { deep: true },
);
</script>

<template>
  <!-- Media Grid -->
  <div
    v-if="media?.length"
    class="mb-3 px-6"
  >
    <div
      class="tweet-media-grid"
      :class="mediaGridClass"
    >
      <div
        v-for="(item, index) in media"
        :key="index"
        class="media-item"
        @click="item ? openLightbox(item, index) : null"
      >
        <div
          v-if="item && item.data"
          class="media-container"
        >
          <img
            v-if="item.type === 'photo'"
            :src="item.data"
            loading="lazy"
            alt="Tweet media"
          />
          <div
            v-else
            class="video-preview"
          >
            <video
              :src="item.data"
              preload="metadata"
            ></video>
            <!-- Play button overlay -->
            <div class="video-play-overlay">
              <div class="play-button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else-if="item && typeof item.ensureDataUrl === 'function'"
          class="media-container flex items-center justify-center"
        >
          <svg
            class="h-8 w-8 animate-spin text-orange-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
            ></path>
          </svg>
        </div>
        <div
          v-else
          class="media-container media-error"
        >
          <div class="error-message">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              ></circle>
              <line
                x1="12"
                y1="8"
                x2="12"
                y2="12"
              ></line>
              <line
                x1="12"
                y1="16"
                x2="12.01"
                y2="16"
              ></line>
            </svg>
            <p>Media not available</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Twitter-like Media Grid System - Only grid layouts that Tailwind can't handle easily */
.tweet-media-grid {
  @apply relative z-0 mb-0 mt-0 w-full overflow-hidden rounded-2xl border border-orange-600;
  /* Prevent layout shift and force GPU rendering */
  contain: layout style paint;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.media-item {
  @apply relative cursor-pointer overflow-hidden;
}

.media-item:hover .media-container::after {
  @apply pointer-events-none absolute inset-0 bg-black bg-opacity-10;
  content: "";
}

.media-item:hover .play-button {
  @apply scale-110;
}

/* Grid layouts with specific heights for DPI scaling */
.media-grid-single {
  @apply grid grid-cols-1 gap-0.5;
}

.media-grid-single .media-container {
  @apply relative w-full overflow-hidden;
  height: 0;
  padding-bottom: 75%; /* 4:3 ratio = 75% (3/4 = 0.75) */
}

.media-grid-two {
  @apply grid grid-cols-2 gap-0.5;
  height: 256px;
}

.media-grid-two .media-container {
  @apply relative aspect-square h-full overflow-hidden;
}

.media-grid-three {
  @apply grid gap-0.5;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
  height: 384px;
}

.media-grid-three .media-item:first-child {
  grid-row: 1 / 3;
}

.media-grid-three .media-item:first-child .media-container {
  @apply h-full;
  aspect-ratio: 2 / 3;
}

.media-grid-three .media-item:not(:first-child) .media-container {
  @apply aspect-square h-full;
}

.media-grid-four {
  @apply grid grid-cols-2 grid-rows-2 gap-0.5;
  height: 256px;
}

.media-grid-four .media-container {
  @apply relative aspect-square h-full overflow-hidden;
}

/* Media container styles */
.media-container {
  @apply relative w-full overflow-hidden bg-slate-100 dark:bg-slate-800;
  contain: strict;
}

.media-container.media-error {
  @apply flex items-center justify-center bg-red-50 dark:bg-red-900/20;
}

.error-message {
  @apply text-center text-red-500;
}

.error-message svg {
  @apply mx-auto mb-2 stroke-red-500;
}

.error-message p {
  @apply text-xs font-medium;
}

.media-container img {
  @apply absolute inset-0 block h-full w-full object-cover opacity-0;
  animation: fadeIn 0.2s ease-in forwards;
}

.video-preview {
  @apply absolute inset-0 overflow-hidden;
}

.video-preview video {
  @apply pointer-events-none absolute inset-0 block h-full w-full bg-black object-cover;
}

.video-play-overlay {
  @apply pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-30;
}

.play-button {
  @apply flex items-center justify-center rounded-full shadow-lg transition-transform;
  width: 68px;
  height: 68px;
  background-color: rgba(234, 88, 12, 0.9); /* orange-600 with transparency */
}

.play-button svg {
  @apply ml-1; /* Center the triangle visually */
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style>
