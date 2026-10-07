import { platforma } from "@platforma-open/milaboratories.batch-correction.model";
import { defineAppV3 } from "@platforma-sdk/ui-vue";
import MainPage from "./pages/MainPage.vue";
import UMAP from "./pages/UMAP.vue";
import tSNE from "./pages/tSNE.vue";

export const sdkPlugin = defineAppV3(platforma, () => {
  return {
    routes: {
      "/": () => MainPage,
      "/umap": () => UMAP,
      "/tsne": () => tSNE,
    },
  };
});

export const useApp = sdkPlugin.useApp;
