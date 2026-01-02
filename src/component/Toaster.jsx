import React from "react"
import { Toaster as HotToaster } from "react-hot-toast"


export default function Toaster() {
  return (
    <HotToaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        style: {
          background: "#1f2937",
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
        success: {
          style: { background: "#16a34a" },
        },
        error: {
          style: { background: "#dc2626" },
        },
      }}
    />
  )
}
