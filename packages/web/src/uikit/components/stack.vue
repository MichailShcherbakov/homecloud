<template>
  <div class="ui-stack" :style="style"><slot /></div>
</template>

<script setup lang="ts">
import { StyleValue } from "vue";

const props = defineProps<{
  column?: boolean;
  columnRev?: boolean;
  row?: boolean;
  rowRef?: boolean;
  alignItems?: "flex-start" | "flex-end" | "center";
  justifyContent?: "flex-start" | "flex-end" | "center" | "space-between";
  wrap?: boolean;
  gap?: number;
  fullWidth?: boolean;
}>();

const style: StyleValue = {
  flexDirection: props.row
    ? "row"
    : props.rowRef
    ? "row-reverse"
    : props.column
    ? "column"
    : props.columnRev
    ? "column-reverse"
    : "row",
  alignItems: props.alignItems ?? "flex-start",
  justifyContent: props.justifyContent ?? "flex-start",
  flexWrap: props.wrap ? "wrap" : undefined,
  gap: `${(props.gap ?? 0) * 8}px`,
  width: props.fullWidth ? "100%" : undefined,
};
</script>

<style lang="scss">
.ui-stack {
  display: flex;
}
</style>
