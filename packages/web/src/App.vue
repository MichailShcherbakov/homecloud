<template>
  <v-app>
    <app-bar title="Home Cloud" subtitle="Your personal space" />
    <v-main class="main">
      <v-container
        class="hosts"
        :class="{ 'hosts--loading': hostsStore.isLoading }"
      >
        <v-row v-if="hostsStore.isLoading">
          <v-col cols="12" sm="12">
            <ui-stack column full-width>
              <v-progress-linear
                class="hosts-loading__progress"
                indeterminate
              />
              <ui-stack
                column
                align-items="center"
                full-width
                class="hosts-loading__inner"
                :gap="1"
              >
                <host-icon class="hosts-loading__icon" />
                <ui-typography variant="h4"> Scaning hosts... </ui-typography>
                <ui-typography variant="body1" color="secondary">
                  It may take a few seconds
                </ui-typography>
              </ui-stack>
            </ui-stack>
          </v-col>
        </v-row>
        <v-row v-else>
          <v-col
            v-for="host in hostsStore.hosts"
            :key="host.ip"
            cols="12"
            sm="4"
          >
            <host-card
              :name="host.name"
              :ip="host.ip"
              :files="host.totalFileCount"
              :dirs="host.totalDirsCount"
              :space-size="Number.parseFloat(host.totalSpaceUsed.toFixed(2))"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import HostIcon from "~/assets/poll_black_24dp.svg?component";
import AppBar from "./components/app-bar/app-bar.vue";
import HostCard from "./components/cards/host-card.vue";
import { UiStack, UiTypography } from "~/uikit";
import { useHostsStore } from "./stores/hosts";

const hostsStore = useHostsStore();
</script>

<style lang="scss" scoped>
.main {
  @include ui-py(1rem);
}
.hosts {
  @include ui-p(0);

  &--loading {
    border: 1px solid $ui-border-color;
    border-radius: $ui-border-radius;
  }

  &-loading {
    &__inner {
      @include ui-p(1rem);
    }

    &__icon {
      fill: $ui-primary-color;
    }

    &__progress {
      color: $ui-primary-color;

      border-top-left-radius: $ui-border-radius;
      border-top-right-radius: $ui-border-radius;
    }
  }
}
</style>
