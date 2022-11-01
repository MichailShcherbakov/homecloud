import React from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { HomePage } from "@client/pages";

export interface AppProps {}

export const App: React.FC<AppProps> = () => {
  return (
    <HashRouter basename="/">
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </HashRouter>
  );
};
