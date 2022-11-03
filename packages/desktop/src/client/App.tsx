import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "@client/pages";
import { DirPage } from "./pages/DirPage";
import {
  SubscriptionsProvider,
  useSocket,
} from "./common/SubscriptionsContext";

export interface AppProps {}

export const App: React.FC<AppProps> = () => {
  const socket = useSocket();

  return (
    <SubscriptionsProvider value={{ socket }}>
      <HashRouter basename="/">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dirs/:uuid" element={<DirPage />} />
        </Routes>
      </HashRouter>
    </SubscriptionsProvider>
  );
};
