<script setup>
import { ref, reactive, watch } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(["close"]);
const { t } = useI18n();

const form = reactive({
  name: "",
  email: "",
  message: "",
  website: "",
  timestamp: Math.floor(Date.now() / 1000),
});

const errors = reactive({
  name: "",
  email: "",
  message: "",
  generic: "",
});

const status = ref("");
const isSending = ref(false);

function resetForm() {
  form.name = "";
  form.email = "";
  form.message = "";
  form.website = "";
  form.timestamp = Math.floor(Date.now() / 1000);
  errors.name = "";
  errors.email = "";
  errors.message = "";
  errors.generic = "";
}

function resetStatus() {
  status.value = "";
}

function close() {
  emit("close");
}

watch(
  () => props.show,
  (visible) => {
    if (!visible) {
      resetForm();
      resetStatus();
    }
  },
);

function validate() {
  let valid = true;
  errors.name = "";
  errors.email = "";
  errors.message = "";
  errors.generic = "";

  if (!form.name.trim()) {
    errors.name = t("contact.validation.name");
    valid = false;
  }

  if (!form.email.trim()) {
    errors.email = t("contact.validation.emailRequired");
    valid = false;
  } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.email = t("contact.validation.emailInvalid");
    valid = false;
  }

  if (!form.message.trim()) {
    errors.message = t("contact.validation.message");
    valid = false;
  } else if (form.message.trim().length < 10) {
    errors.message = t("contact.validation.messageShort");
    valid = false;
  }

  return valid;
}

async function submitForm() {
  if (isSending.value) return;
  errors.generic = "";
  resetStatus();

  if (!validate()) {
    return;
  }

  if (form.website.trim()) {
    errors.generic = t("contact.validation.spam");
    return;
  }

  const elapsed = Math.floor(Date.now() / 1000) - form.timestamp;
  if (elapsed < 3) {
    errors.generic = t("contact.validation.wait");
    return;
  }

  isSending.value = true;

  try {
    const response = await fetch("https://contact.yinside.de/phpmailer.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        website: form.website,
        timestamp: form.timestamp,
      }),
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      errors.generic = result.error || t("contact.error");
    } else {
      status.value = t("contact.success");
      resetForm();
    }
  } catch (err) {
    errors.generic = t("contact.error");
  } finally {
    isSending.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade-scale">
      <div
        v-if="show"
        class="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
        @click.self="close"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="'contact-modal-title'"
      >
        <div
          class="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
        >
          <header
            class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700"
          >
            <h2
              id="contact-modal-title"
              class="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              {{ t("contact.title") }}
            </h2>
            <button
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

          <main
            class="max-h-[70vh] overflow-y-auto px-6 py-6 text-sm text-gray-700 dark:text-gray-300"
          >
            <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {{ t("contact.description") }}
            </p>

            <div class="space-y-4">
              <template v-if="!status">
                <div>
                  <label
                    class="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
                    for="contact-name"
                  >
                    {{ t("contact.name") }}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
                    v-model="form.name"
                    :placeholder="t('contact.placeholders.name')"
                    autocomplete="name"
                  />
                  <p
                    v-if="errors.name"
                    class="mt-2 text-xs text-red-600 dark:text-red-400"
                  >
                    {{ errors.name }}
                  </p>
                </div>

                <div>
                  <label
                    class="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
                    for="contact-email"
                  >
                    {{ t("contact.email") }}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
                    v-model="form.email"
                    :placeholder="t('contact.placeholders.email', { at: '@' })"
                    autocomplete="email"
                  />
                  <p
                    v-if="errors.email"
                    class="mt-2 text-xs text-red-600 dark:text-red-400"
                  >
                    {{ errors.email }}
                  </p>
                </div>

                <div>
                  <label
                    class="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
                    for="contact-message"
                  >
                    {{ t("contact.message") }}
                  </label>
                  <textarea
                    id="contact-message"
                    rows="5"
                    class="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
                    v-model="form.message"
                    :placeholder="t('contact.placeholders.message')"
                  ></textarea>
                  <p
                    v-if="errors.message"
                    class="mt-2 text-xs text-red-600 dark:text-red-400"
                  >
                    {{ errors.message }}
                  </p>
                </div>

                <div class="sr-only">
                  <label for="contact-website">{{
                    t("contact.honeypot")
                  }}</label>
                  <input
                    id="contact-website"
                    type="text"
                    v-model="form.website"
                    autocomplete="off"
                  />
                </div>
              </template>

              <div
                v-if="errors.generic"
                class="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700/50 dark:bg-red-900/10 dark:text-red-200"
              >
                {{ errors.generic }}
              </div>

              <div
                v-if="status"
                class="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-700/50 dark:bg-green-900/10 dark:text-green-200"
              >
                {{ status }}
              </div>
            </div>

            <div
              v-if="!status"
              class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <button
                type="button"
                @click="submitForm"
                :disabled="isSending"
                class="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-white transition-all hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-orange-600 dark:hover:bg-orange-700"
              >
                {{ isSending ? t("contact.sending") : t("contact.submit") }}
              </button>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ t("contact.privacyNote") }}
              </p>
            </div>
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
