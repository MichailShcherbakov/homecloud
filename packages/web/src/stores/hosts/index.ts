import { defineStore } from "pinia";
import { onMounted, ref } from "vue";
import { Host, scanHosts } from "./helpers/scan-hosts";

export const useHostsStore = defineStore("hosts", () => {
  const isLoading = ref(true);
  const hosts = ref<Host[]>([]);

  onMounted(async () => {
    const foundHosts = await scanHosts();
    hosts.value = foundHosts;
    isLoading.value = false;
  });

  return {
    hosts,
    isLoading,
  };
});
