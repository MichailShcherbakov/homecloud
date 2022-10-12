<template>
  <ui-stack column class="host-card" :gap="2">
    <host-icon class="host-card__icon" />
    <ui-stack column :gap="0.5">
      <ui-typography as="p" variant="h4">{{ name }}</ui-typography>
      <ui-typography as="p" variant="subtitle1">{{ ip }}</ui-typography>
    </ui-stack>
    <ui-stack column :gap="0.5">
      <ui-stack align-items="center" :gap="1">
        <folder-icon class="host-card__option-icon" />
        <ui-typography as="p">Folders: {{ dirs }}</ui-typography>
      </ui-stack>
      <ui-stack align-items="center" :gap="1">
        <file-icon class="host-card__option-icon" />
        <ui-typography as="p">Files: {{ files }}</ui-typography>
      </ui-stack>
    </ui-stack>
    <ui-stack align-items="center" :gap="1">
      <space-icon class="host-card__option-icon" />
      <ui-typography as="p" variant="subtitle2">
        Space Used: {{ spaceSize }} GB
      </ui-typography>
    </ui-stack>
    <v-btn variant="text">Connect</v-btn>
  </ui-stack>
</template>

<script setup lang="ts">
import { UiStack, UiTypography } from "~/uikit";
import HostIcon from "~/assets/poll_black_24dp.svg?component";
import FolderIcon from "~/assets/folder_open_black_24dp.svg?component";
import FileIcon from "~/assets/description_black_24dp.svg?component";
import SpaceIcon from "~/assets/data_usage_black_24dp.svg?component";

defineProps<{
  name: string;
  ip: string;
  dirs?: number;
  files?: number;
  spaceSize?: number;
}>();
</script>

<style lang="scss">
.host-card {
  border-radius: $ui-border-radius;
  border: 1px solid $ui-border-color;

  @include ui-p(1rem);

  &__icon {
    @include ui-size(48px);

    fill: $blue-400;
  }

  &__option-icon {
    fill: $gray-400;
  }
}
</style>
