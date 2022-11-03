import React from "react";
import {
  BrowserRouter,
  HashRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { HomePage } from "@client/pages";
import { DirPage } from "./pages/DirPage";

export interface AppProps {}

export const App: React.FC<AppProps> = () => {
  return (
    <HashRouter basename="/">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dirs/:uuid" element={<DirPage />} />
      </Routes>
    </HashRouter>
  );
};
