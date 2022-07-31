const { createApp, computed, reactive } = Vue;
const { ipcRenderer } = require("electron");

function isEmptyString(str) {
  return str === "";
}

const app = createApp({
  setup() {
    const status = reactive({
      created: false,
      hasError: false,
    });

    const data = reactive({
      label: "",
      description: "",
      protocol: "tcp",
      host: "localhost",
      port: 2376,
    });

    const label = computed({
      get() {
        return data.label;
      },
      set(val) {
        data.label = _.kebabCase(val);
      },
    });

    async function handleSubmit() {
      status.created = false;
      status.hasError = false;

      const response = ipcRenderer.sendSync("create-context", {
        label: label.value.trim(),
        description: data.description,
        protocol: data.protocol,
        host: data.host,
        port: data.port,
      });

      if (response === "ok") {
        status.created = true;

        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        status.hasError = true;
      }
    }

    const createDisabled = computed(() => {
      return (
        isEmptyString(label.value) ||
        isEmptyString(data.host) ||
        isEmptyString(data.port)
      );
    });

    const endpointPreview = computed(() => {
      return `${data.protocol}://${data.host}:${data.port}`;
    });

    return {
      label,
      data,
      handleSubmit,
      createDisabled,
      status,
      endpointPreview,
    };
  },
});

app.mount("#app");
