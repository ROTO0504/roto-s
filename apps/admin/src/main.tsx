import React from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router"

import { ConfirmProvider } from "./components/ConfirmDialog"
import { ToastProvider } from "./components/ToastProvider"
import { router } from "./router"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <ConfirmProvider>
        <RouterProvider router={router} />
      </ConfirmProvider>
    </ToastProvider>
  </React.StrictMode>,
)
