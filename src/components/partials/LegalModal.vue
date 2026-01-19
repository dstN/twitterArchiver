<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(["close"]);

const { t } = useI18n();

// Refs for accessibility
const modalRef = ref(null);
const closeButtonRef = ref(null);
const previousActiveElement = ref(null);

// Email obfuscation - prevents scraping while showing readable email
const emailParts = {
  user: "abuse",
  domain: "yinside",
  tld: "de",
};

const obfuscatedEmail = computed(() => {
  return `${emailParts.user}@${emailParts.domain}.${emailParts.tld}`;
});

const mailtoHref = computed(() => {
  return `mailto:${emailParts.user}@${emailParts.domain}.${emailParts.tld}`;
});

function close() {
  emit("close");
}

// Accessibility: Handle keyboard navigation
function handleKeydown(event) {
  if (!props.show) return;

  if (event.key === "Escape") {
    close();
    return;
  }

  // Trap focus within modal
  if (event.key === "Tab" && modalRef.value) {
    const focusableElements = modalRef.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }
}

// Accessibility: Focus management
watch(
  () => props.show,
  async (newValue) => {
    if (newValue) {
      // Store the previously focused element
      previousActiveElement.value = document.activeElement;
      // Wait for DOM update then focus the close button
      await nextTick();
      closeButtonRef.value?.focus();
    } else {
      // Restore focus to the previously focused element
      previousActiveElement.value?.focus();
    }
  },
);

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="fade-scale">
      <div
        v-if="show"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
        @click.self="close"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="'legal-modal-title'"
        :aria-describedby="'legal-modal-description'"
      >
        <div
          ref="modalRef"
          class="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
          role="document"
        >
          <!-- Header -->
          <header
            class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700"
          >
            <h2
              id="legal-modal-title"
              class="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              {{ t("legal.title") }}
            </h2>
            <button
              ref="closeButtonRef"
              type="button"
              @click="close"
              class="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-offset-gray-800"
              :aria-label="t('legal.close')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </header>

          <!-- Content -->
          <main
            id="legal-modal-description"
            class="max-h-[70vh] overflow-y-auto px-6 py-6 text-sm"
          >
            <!-- Imprint Section -->
            <section
              aria-labelledby="imprint-heading"
              class="mb-8"
            >
              <h3
                id="imprint-heading"
                class="mb-4 text-lg font-semibold text-orange-600 dark:text-orange-500"
              >
                {{ t("legal.imprint.title") }}
              </h3>
              <address
                class="space-y-1 not-italic text-gray-700 dark:text-gray-300"
              >
                <p class="font-medium">{{ t("legal.imprint.responsible") }}</p>
                <p>Dustin Tramm</p>
                <p>Impressums-Service Impressum4u</p>
                <p>c/o LEADERLY UG (haftungsbeschränkt)</p>
                <p>Amtstraße 22</p>
                <p>44575 Castrop-Rauxel</p>
                <p>Deutschland</p>
                <p class="mt-4">
                  <span class="font-medium"
                    >{{ t("legal.imprint.email") }}:</span
                  >
                  <a
                    :href="mailtoHref"
                    class="ml-1 text-orange-600 hover:underline focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 dark:text-orange-500 dark:focus:ring-offset-gray-800"
                    :aria-label="t('legal.imprint.emailAriaLabel')"
                  >
                    <!-- Obfuscated email display -->
                    <span aria-hidden="true">{{ emailParts.user }}</span>
                    <span aria-hidden="true">@</span>
                    <span aria-hidden="true">{{ emailParts.domain }}</span>
                    <span aria-hidden="true">.</span>
                    <span aria-hidden="true">{{ emailParts.tld }}</span>
                    <span class="sr-only">{{ obfuscatedEmail }}</span>
                  </a>
                </p>
              </address>
              <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {{ t("legal.imprint.disclaimer") }}
              </p>
            </section>

            <!-- Privacy Policy Section -->
            <section aria-labelledby="privacy-heading">
              <h3
                id="privacy-heading"
                class="mb-4 text-lg font-semibold text-orange-600 dark:text-orange-500"
              >
                {{ t("legal.privacy.title") }}
              </h3>
              <div class="space-y-4 text-gray-700 dark:text-gray-300">
                <p>{{ t("legal.privacy.intro") }}</p>

                <div>
                  <h4 class="mb-2 font-medium">
                    {{ t("legal.privacy.hosting.title") }}
                  </h4>
                  <p>{{ t("legal.privacy.hosting.content") }}</p>
                </div>

                <div>
                  <h4 class="mb-2 font-medium">
                    {{ t("legal.privacy.logs.title") }}
                  </h4>
                  <p>{{ t("legal.privacy.logs.content") }}</p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
