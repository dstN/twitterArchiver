import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import TheSpinner from "./components/TheSpinner.vue";
import TheDropzone from "./components/TheDropzone.vue";
import TheContent from "./components/TheContent.vue";
import VueVirtualScroller from "vue-virtual-scroller";
import { createI18n } from 'vue-i18n';

import i18nEnglish from './assets/i18n/en.json'
const i18n = createI18n({
    locale: 'en',
    messages: {
        en: i18nEnglish
    }
});

const app = createApp(App);
app.use(i18n);
app.use(VueVirtualScroller);
app.component("TheSpinner", TheSpinner);
app.component("TheDropzone", TheDropzone);
app.component("TheContent", TheContent);
app.mount("#app");
