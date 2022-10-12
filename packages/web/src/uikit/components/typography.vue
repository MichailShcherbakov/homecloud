<template>
  <component
    :is="as ?? is[variant ?? 'body1']"
    class="ui-typography"
    :class="[
      `ui-typography-${variant ?? 'body1'}`,
      `ui-typography-${color ?? 'text'}`,
    ]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
defineProps<{
  as?: string;
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "subtitle1"
    | "subtitle2"
    | "body1"
    | "body2"
    | "button";
  color?: "text" | "primary" | "secondary";
}>();

const is = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  subtitle1: "p",
  subtitle2: "p",
  body1: "span",
  body2: "span",
  button: "span",
};
</script>

<style lang="scss">
.ui-typography {
  line-height: 1;

  &-text {
    color: $ui-text-color;
  }

  &-primary {
    color: $ui-primary-color;
  }

  &-secondary {
    color: $ui-secondary-color;
  }
}

.ui-typography-h1 {
  font-size: 34px;
  font-weight: 700;
}

.ui-typography-h2 {
  font-size: 32px;
  font-weight: 700;
}

.ui-typography-h3 {
  font-size: 24px;
  font-weight: 700;
}

.ui-typography-h4 {
  font-size: 18px;
  font-weight: 700;
}

.ui-typography-h5 {
  font-size: 16px;
  font-weight: 700;
}

.ui-typography-h6 {
  font-size: 14px;
  font-weight: 500;
}

.ui-typography-body1 {
  font-size: 14px;
  font-weight: 500;
}

.ui-typography-body2 {
  font-size: 16px;
  font-weight: 500;
}

.ui-typography-button {
  font-size: 14px;
  font-weight: 500;
}

.ui-typography-subtitle1 {
  font-size: 12px;
  font-weight: 500;

  color: $gray-400;
}

.ui-typography-subtitle2 {
  font-size: 12px;
  font-weight: 500;
}
</style>
