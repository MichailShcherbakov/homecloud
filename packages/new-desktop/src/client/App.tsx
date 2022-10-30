import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "@client/pages";

export interface AppProps {}

export const App: React.FC<AppProps> = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
};
