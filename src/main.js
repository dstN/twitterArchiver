import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import TheSpinner from './components/TheSpinner.vue';

const app = createApp(App);
app.component("the-spinner", TheSpinner)
app.mount('#app')
