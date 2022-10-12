<template>
  <ui-stack class="app-bar" align-items="center" full-width>
    <ui-stack align-items="center" justify-content="center" :gap="2">
      <logo-icon class="app-bar__icon" />
      <ui-stack column :gap="0.25">
        <ui-typography variant="h3" class="app-bar__title">
          {{ title }}
        </ui-typography>
        <ui-typography v-if="subtitle" variant="subtitle2">
          {{ subtitle }}
        </ui-typography>
      </ui-stack>
    </ui-stack>
  </ui-stack>
</template>

<script setup lang="ts">
import { UiStack, UiTypography } from "~/uikit";
import LogoIcon from "~/assets/logo.svg?component";

defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<style lang="scss" scoped>
.app-bar {
  height: 70px;
  border-bottom: 1px solid $ui-border-color;

  @include ui-px(1rem);

  &__title {
    color: $blue-400;
  }

  &__icon {
    @include ui-size(48px);
  }
}
</style>
