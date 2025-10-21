<script setup>
import { ref, watch, onUnmounted, computed } from "vue";
import { useKeyboardNavigation } from "../../composables/useKeyboardNavigation";

const props = defineProps({
  media: Object,
  allMedia: Array,
  initialIndex: Number,
  show: Boolean,
});

const emit = defineEmits(["close"]);

const currentIndex = ref(props.initialIndex || 0);
const videoRef = ref(null);

const currentMedia = computed(() => {
  if (props.allMedia && props.allMedia[currentIndex.value]) {
    return props.allMedia[currentIndex.value];
  }
  return props.media;
});

// Store scroll position
let scrollY = 0;

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      // Save current scroll position
      scrollY = window.scrollY;

      // Prevent scrolling without hiding scrollbar
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflowY = "scroll"; // Keep scrollbar visible

      currentIndex.value = props.initialIndex || 0;
      // Auto-play video when lightbox opens
      setTimeout(() => {
        if (currentMedia.value?.type !== "photo" && videoRef.value) {
          videoRef.value.play();
        }
      }, 100);
    } else {
      // Restore scroll position WITHOUT animation/jump
      const scrollPos = scrollY;

      // Remove fixed positioning first
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";

      // Restore scroll INSTANTLY (not after next frame)
      // Use scrollTo with instant behavior
      window.scrollTo({
        top: scrollPos,
        left: 0,
        behavior: "instant", // No animation
      });
    }
  },
);

function close() {
  emit("close");
}

function next() {
  if (props.allMedia && currentIndex.value < props.allMedia.length - 1) {
    currentIndex.value++;
  }
}

function prev() {
  if (props.allMedia && currentIndex.value > 0) {
    currentIndex.value--;
  }
}

// Set up keyboard navigation
useKeyboardNavigation(
  {
    onEscape: close,
    onArrowLeft: prev,
    onArrowRight: next,
  },
  () => props.show,
);

onUnmounted(() => {
  // Cleanup in case component unmounts while lightbox is open
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  document.body.style.overflowY = "";
});
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="show"
        class="lightbox-overlay"
        @click.self="close"
      >
        <button
          class="lightbox-close"
          @click="close"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line
              x1="18"
              y1="6"
              x2="6"
              y2="18"
            ></line>
            <line
              x1="6"
              y1="6"
              x2="18"
              y2="18"
            ></line>
          </svg>
        </button>

        <div
          v-if="currentMedia"
          class="lightbox-content"
        >
          <img
            v-if="currentMedia.type === 'photo'"
            :src="currentMedia.data"
            alt="Tweet media"
            class="lightbox-media"
          />
          <video
            v-else-if="currentMedia.type && currentMedia.data"
            ref="videoRef"
            :src="currentMedia.data"
            controls
            autoplay
            class="lightbox-media"
          ></video>
        </div>
        <div
          v-else
          class="lightbox-content"
        >
          <p class="text-white">Error: Media not found</p>
        </div>

        <!-- Navigation arrows for multiple media -->
        <template v-if="allMedia && allMedia.length > 1">
          <button
            v-if="currentIndex > 0"
            class="lightbox-nav lightbox-nav-prev"
            @click="prev"
            aria-label="Previous"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <button
            v-if="currentIndex < allMedia.length - 1"
            class="lightbox-nav lightbox-nav-next"
            @click="next"
            aria-label="Next"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <div class="lightbox-counter">
            {{ currentIndex + 1 }} / {{ allMedia.length }}
          </div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.lightbox-content {
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-media {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  z-index: 10001;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  z-index: 10001;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lightbox-nav-prev {
  left: 20px;
}

.lightbox-nav-next {
  right: 20px;
}

.lightbox-counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

/* Transitions */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
