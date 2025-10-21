<script setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faBluesky,
  faThreads,
  faMastodon,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import { useShareActions } from "../../composables/useShareActions";

const props = defineProps({
  tweetText: String,
  tweetUrl: String,
  isThread: Boolean,
  threadTweets: Array, // For thread sharing
});

const emit = defineEmits(["close"]);

const {
  showCopiedFeedback,
  copyTweetText,
  copyThreadText,
  shareToBluesky,
  shareToThreads,
  shareToMastodon,
  shareToLinkedIn,
} = useShareActions();

function copyTweet() {
  copyTweetText(props.tweetText);
}

function copyThread() {
  copyThreadText(props.threadTweets);
}

function handleShareToBluesky() {
  shareToBluesky(props.tweetText, () => emit("close"));
}

function handleShareToThreads() {
  shareToThreads(props.tweetText, () => emit("close"));
}

function handleShareToMastodon() {
  shareToMastodon(props.tweetText, () => emit("close"));
}

function handleShareToLinkedIn() {
  shareToLinkedIn(props.tweetText, () => emit("close"));
}

function close() {
  emit("close");
}
</script>

<template>
  <div
    class="share-menu-overlay"
    @click.self="close"
  >
    <div
      class="share-menu w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
    >
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">
          Share {{ isThread ? "Thread" : "Tweet" }}
        </h3>
        <button
          @click="close"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Copied Feedback -->
      <div
        v-if="showCopiedFeedback"
        class="mb-4 flex items-center gap-2 rounded-lg bg-green-100 p-3 text-green-800 dark:bg-green-900 dark:text-green-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        Copied to clipboard!
      </div>

      <!-- Copy Options -->
      <div class="mb-4 space-y-2">
        <button
          @click="copyTweet"
          class="flex w-full items-center gap-3 rounded-lg bg-gray-100 p-3 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-700 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span class="font-medium text-gray-900 dark:text-gray-100"
            >Copy {{ isThread ? "Tweet" : "Text" }}</span
          >
        </button>

        <button
          v-if="isThread && threadTweets?.length > 0"
          @click="copyThread"
          class="flex w-full items-center gap-3 rounded-lg bg-gray-100 p-3 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-700 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span class="font-medium text-gray-900 dark:text-gray-100"
            >Copy Entire Thread ({{ threadTweets.length }} tweets)</span
          >
        </button>
      </div>

      <!-- Share to Platforms -->
      <div class="border-t border-gray-200 pt-4 dark:border-gray-700">
        <p class="mb-3 text-sm text-gray-600 dark:text-gray-400">
          Share to platform:
        </p>
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="handleShareToBluesky"
            class="flex items-center gap-2 rounded-lg bg-blue-500 p-3 text-white transition-colors hover:bg-blue-600"
          >
            <font-awesome-icon
              :icon="faBluesky"
              class="h-5 w-5"
            />
            <span class="font-medium">Bluesky</span>
          </button>

          <button
            @click="handleShareToThreads"
            class="flex items-center gap-2 rounded-lg bg-black p-3 text-white transition-colors hover:bg-gray-800"
          >
            <font-awesome-icon
              :icon="faThreads"
              class="h-5 w-5"
            />
            <span class="font-medium">Threads</span>
          </button>

          <button
            @click="handleShareToMastodon"
            class="flex items-center gap-2 rounded-lg bg-purple-600 p-3 text-white transition-colors hover:bg-purple-700"
          >
            <font-awesome-icon
              :icon="faMastodon"
              class="h-5 w-5"
            />
            <span class="font-medium">Mastodon</span>
          </button>

          <button
            @click="handleShareToLinkedIn"
            class="flex items-center gap-2 rounded-lg bg-blue-700 p-3 text-white transition-colors hover:bg-blue-800"
          >
            <font-awesome-icon
              :icon="faLinkedin"
              class="h-5 w-5"
            />
            <span class="font-medium">LinkedIn</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.share-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.share-menu {
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
