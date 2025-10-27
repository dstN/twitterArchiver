<script setup>
import { computed } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faBottleWater, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { useI18n } from "vue-i18n";

const props = defineProps({
  isDarkMode: Boolean,
});

const emit = defineEmits(["toggleDarkMode"]);

function toggleDarkMode() {
  emit("toggleDarkMode");
}

const { t, locale } = useI18n();

const availableLocales = ["en", "de"];

const currentLocaleLabel = computed(() => locale.value.toUpperCase());

function toggleLocale() {
  const currentIndex = availableLocales.indexOf(locale.value);
  const nextLocale =
    availableLocales[(currentIndex + 1) % availableLocales.length];
  locale.value = nextLocale;
  localStorage.setItem("locale", nextLocale);
}
</script>

<template>
  <!-- Bottom Action Bar -->
  <div class="border-t border-gray-200 p-4 dark:border-gray-700">
    <div class="flex items-center justify-around gap-2">
      <!-- Dark Mode Toggle -->
      <button
        @click="toggleDarkMode"
        class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-white transition-colors hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
        :title="isDarkMode ? t('mobile.bottomBar.lightMode') : t('mobile.bottomBar.darkMode')"
        :aria-label="isDarkMode ? t('mobile.bottomBar.lightMode') : t('mobile.bottomBar.darkMode')"
      >
        <svg
          v-if="!isDarkMode"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-gray-300"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fill-rule="evenodd"
            d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <!-- Language Toggle -->
      <button
        @click="toggleLocale"
        class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-white transition-colors hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
        :title="t('mobile.bottomBar.languageToggle', { locale: currentLocaleLabel })"
        :aria-label="t('mobile.bottomBar.languageToggle', { locale: currentLocaleLabel })"
      >
        <font-awesome-icon
          :icon="faGlobe"
          class="h-5 w-5"
        />
        <span class="sr-only">{{ t('mobile.bottomBar.languageCurrent', { locale: currentLocaleLabel }) }}</span>
      </button>

      <!-- Ko-fi Link -->
      <a
        href="https://ko-fi.com/dstn"
        target="_blank"
        rel="noopener noreferrer"
        class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-white transition-all hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
        :title="t('sidebar.support.buyMeCoffee')"
        :aria-label="t('sidebar.support.buyMeCoffee')"
      >
        <font-awesome-icon
          :icon="faBottleWater"
          class="h-5 w-5"
        />
      </a>

      <!-- GitHub Link -->
      <a
        href="https://github.com/dstN/twitterArchiver"
        target="_blank"
        rel="noopener noreferrer"
        class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-white transition-all hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
        :title="t('sidebar.support.viewOnGitHub')"
        :aria-label="t('sidebar.support.viewOnGitHub')"
      >
        <font-awesome-icon
          :icon="faGithub"
          class="h-5 w-5"
        />
      </a>
    </div>
  </div>
</template>
