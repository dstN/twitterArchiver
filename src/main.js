import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import TheSpinner from "./components/TheSpinner.vue";
import TheDropzone from "./components/TheDropzone.vue";
import TheContent from "./components/TheContent.vue";
import VueVirtualScroller from "vue-virtual-scroller";

const app = createApp(App);
app.use(VueVirtualScroller);
app.component("TheSpinner", TheSpinner);
app.component("TheDropzone", TheDropzone);
app.component("TheContent", TheContent);
app.mount("#app");
