import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app/App";
import { ModalHost } from "./ui/modal";
import "./styles/app.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ModalHost>
        <App />
      </ModalHost>
    </BrowserRouter>
  </StrictMode>,
);
