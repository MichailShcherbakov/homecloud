import { createApp } from "vue";

import "./uikit/styles/main.classes.scss";

import App from "./App.vue";

import vuetify from "./plugins/vuetify";
import pinia from "./plugins/pinia";
import plyr from "./plugins/plyr";
import { loadFonts } from "./plugins/webfontloader";

loadFonts();

createApp(App).use(vuetify).use(pinia).use(plyr).mount("#app");
