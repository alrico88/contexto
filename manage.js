const { createApp, onMounted, onUnmounted, shallowRef, computed } = Vue;
const { ipcRenderer } = require("electron");

const app = createApp({
  setup() {
    const contexts = shallowRef([]);
    const noContexts = computed(() => contexts.value.length === 0);

    function updateContexts(_, list) {
      contexts.value = list;
    }

    function openCreateWindow() {
      ipcRenderer.send("open-create-window");
    }

    onMounted(() => {
      ipcRenderer.send("get-contexts");

      ipcRenderer.on("update-contexts-list", updateContexts);
    });

    onUnmounted(() => {
      ipcRenderer.off("update-contexts-list", updateContexts);
    });

    function useContext(dockerCtx) {
      ipcRenderer.send("use-context", dockerCtx.label);
    }

    function deleteContext(dockerCtx) {
      const confirmed = confirm(
        `Are you sure you want to delete ${dockerCtx.label}?`
      );

      if (!confirmed) {
        return;
      }

      ipcRenderer.send("delete-context", dockerCtx.label);
    }

    return {
      contexts,
      noContexts,
      useContext,
      deleteContext,
      openCreateWindow,
    };
  },
});

app.mount("#app");
