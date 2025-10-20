<script setup>
import { toRefs, computed, ref, onMounted, onUpdated } from "vue";
import TweetDate from "./TweetDate.vue";
import MediaLightbox from "./MediaLightbox.vue";
import TweetShareMenu from "./TweetShareMenu.vue";
import twemoji from "twemoji";

const props = defineProps({
  data: Object,
  user: Object,
  threadTweets: Array, // For thread sharing
  inThreadView: Boolean, // Hide thread button when in thread view
});

const emit = defineEmits(["getThread"]);

const { data, user } = toRefs(props);

const account = computed(() => {
  return user.value.account;
});

const profile = computed(() => {
  return user.value.profile;
});

const mediaGridClass = computed(() => {
  if (!data.value.media?.length) return "";

  const count = data.value.media.length;

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

// Lightbox state
const showLightbox = ref(false);
const lightboxMedia = ref(null);
const lightboxIndex = ref(0);

function openLightbox(media, index) {
  console.log("Opening lightbox:", {
    media,
    index,
    allMedia: data.value.media,
  });

  if (!media || !media.data) {
    console.error("Invalid media:", media);
    return;
  }

  lightboxMedia.value = media;
  lightboxIndex.value = index;
  showLightbox.value = true;
}

function closeLightbox() {
  showLightbox.value = false;
  lightboxMedia.value = null;
}

// Calculate fixed height for the tweet based on content
const tweetHeight = computed(() => {
  const baseHeight = 96; // Header + text padding
  const textEstimate = Math.max(60, Math.ceil(data.value.full_text.length / 2)); // Rough text height estimate

  if (!data.value.media?.length) {
    return baseHeight + textEstimate;
  }

  // Fixed media heights based on grid type
  const mediaHeights = {
    "media-grid-single": 287, // 16:9 aspect ratio
    "media-grid-two": 257, // Square grid
    "media-grid-three": 384, // Mixed layout
    "media-grid-four": 257, // 2x2 grid
  };

  const mediaHeight = mediaHeights[mediaGridClass.value] || 257;
  return baseHeight + textEstimate + mediaHeight + 12; // +12 for margin
});

function getThread() {
  emit("getThread", data.value.id);
}

// Share menu state
const showShareMenu = ref(false);

const tweetUrl = computed(() => {
  return `https://twitter.com/${account.value.username}/status/${data.value.id}`;
});

function openShareMenu() {
  showShareMenu.value = true;
}

function closeShareMenu() {
  showShareMenu.value = false;
}

// Twemoji support
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
  <div class="group relative block w-full">
    <div
      class="px-6 pt-5"
      :class="{ 'pb-1': !data.media?.length }"
    >
      <!-- Tweet Header - Flex wrap for mobile -->
      <div class="mb-3 flex items-center gap-3">
        <!-- Avatar -->
        <div class="flex-shrink-0">
          <a
            :href="`https://twitter.com/i/user/${account.accountId}`"
            target="_blank"
          >
            <img
              :src="profile.Image"
              class="h-12 w-12 rounded-full border border-slate-200 dark:border-gray-600"
            />
          </a>
        </div>

        <!-- User Info and Metadata -->
        <div class="min-w-0 flex-1">
          <!-- Username and Handle -->
          <div
            class="flex flex-wrap items-center gap-x-2 gap-y-1 md:flex-nowrap"
          >
            <a
              :href="`https://twitter.com/i/user/${account.accountId}`"
              target="_blank"
              class="max-w-[200px] truncate font-bold hover:underline dark:text-gray-200"
            >
              {{ account.accountDisplayName }}
            </a>
            <span
              class="truncate text-sm font-normal text-slate-700 dark:text-gray-400"
            >
              @{{ account.username }}
            </span>
            <span class="text-slate-700 dark:text-gray-500">·</span>
            <TweetDate
              :id="data.id"
              :date="data.created_at"
              class="text-sm text-slate-700 dark:text-gray-400"
            />
            <template v-if="data.is_thread && !inThreadView">
              <span class="text-slate-700 dark:text-gray-500">·</span>
              <button
                class="text-sm font-bold text-orange-600 hover:text-orange-600 dark:text-orange-600 dark:hover:text-orange-600"
                @click="getThread"
              >
                {{ $t("tweet.thread") }}
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Tweet Content -->
      <div class="tweet">
        <p
          ref="tweetTextRef"
          v-html="data.full_text"
          class="tweet-text break-words text-base text-gray-700 dark:text-gray-300"
          :class="{ 'mb-3': data.media?.length }"
        ></p>
      </div>
    </div>

    <!-- Media Grid -->
    <div
      v-if="data.media?.length"
      class="mb-3 px-6"
    >
      <div
        class="tweet-media-grid"
        :class="mediaGridClass"
      >
        <div
          v-for="(media, index) in data.media"
          :key="index"
          class="media-item"
          @click="media && media.data ? openLightbox(media, index) : null"
        >
          <div
            v-if="media && media.data"
            class="media-container"
          >
            <img
              v-if="media.type === 'photo'"
              :src="media.data"
              loading="lazy"
              alt="Tweet media"
            />
            <div
              v-else
              class="video-preview"
            >
              <video
                :src="media.data"
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

    <!-- Stats and Actions Row (below media, Twitter-like) -->
    <div
      v-if="!data.retweeted"
      class="px-6 pb-3"
    >
      <div
        class="flex items-center justify-between text-gray-500 dark:text-gray-400"
      >
        <!-- Likes and Retweets Stats -->
        <div class="flex gap-6">
          <div
            v-if="data.likes > 0"
            class="group flex cursor-pointer items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 transition-colors group-hover:fill-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span class="text-sm">{{ data.likes.toLocaleString() }}</span>
          </div>
          <div
            v-if="data.retweets > 0"
            class="group flex cursor-pointer items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 transition-colors group-hover:stroke-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span class="text-sm">{{ data.retweets.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Share Button -->
        <button
          @click="openShareMenu"
          class="group -mr-2 rounded-full p-2 transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20"
          title="Share tweet"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 transition-colors group-hover:stroke-orange-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Lightbox -->
    <MediaLightbox
      v-if="data.media?.length"
      :show="showLightbox"
      :media="lightboxMedia"
      :all-media="data.media"
      :initial-index="lightboxIndex"
      @close="closeLightbox"
    />

    <!-- Share Menu -->
    <TweetShareMenu
      v-if="showShareMenu"
      :tweet-text="data.full_text"
      :tweet-url="tweetUrl"
      :is-thread="data.is_thread"
      :thread-tweets="threadTweets"
      @close="closeShareMenu"
    />
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
  height: 288px; /* Fixed height - divisible by 4 for clean DPI scaling */
}

.media-grid-single .media-container {
  @apply relative aspect-video h-full overflow-hidden;
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
  @apply relative h-full w-full overflow-hidden;
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
<style scoped></style>
