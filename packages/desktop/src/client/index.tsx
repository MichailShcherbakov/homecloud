import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline } from "@mui/material";
import { App } from "./App";

import "@client/styles/globals.css";

const rootElement = document.getElementById("root") as Element;
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <CssBaseline />
    <App />
  </StrictMode>
);
