import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages";

export interface AppProps {}

export const App: React.FC<AppProps> = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/main_window">
          <Route path="" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
