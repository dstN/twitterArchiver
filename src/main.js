import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import TheSpinner from "./components/TheSpinner.vue";
import TheDropzone from "./components/TheDropzone.vue";
import TheContent from "./components/TheContent.vue";
import { createI18n } from "vue-i18n";

import i18nEnglish from "./assets/i18n/en.json";
import i18nGerman from "./assets/i18n/de.json";

const supportedLocales = ["en", "de"];
const storedLocale = localStorage.getItem("locale");
const defaultLocale = supportedLocales.includes(storedLocale)
  ? storedLocale
  : "en";

const i18n = createI18n({
  locale: defaultLocale,
  fallbackLocale: "en",
  legacy: false, // Use Composition API mode
  messages: {
    en: i18nEnglish,
    de: i18nGerman,
  },
});

const app = createApp(App);
app.use(i18n);
app.component("TheSpinner", TheSpinner);
app.component("TheDropzone", TheDropzone);
app.component("TheContent", TheContent);
app.mount("#app");
