import React from "react";
import { Stack } from "@mui/material";
import { AppBar } from "@/client/components/AppBar";

export interface HomePageProps {}

export const HomePage: React.FC<HomePageProps> = () => {
  return (
    <Stack>
      <AppBar />
    </Stack>
  );
};
