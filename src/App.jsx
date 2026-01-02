import React from "react"
import { Link, Routes, Route, Navigate } from "react-router-dom"
import { FileText } from "lucide-react"
import Dashboard from "./component/dashboard"
import Generate from "./component/generate"
import logoImage from "./assets/omnicassion-logo.svg"

function Home() {
  return (
    <main className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center px-6">
      <div className="max-w-5xl text-center">

        <h1 className="heading text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
          Effortless Invoicing.
          <br /> Professional Results.
        </h1>

        <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto">
          Stop wrestling with spreadsheets. QuickInvoice helps you create and send beautiful invoices in minutes —
          so you get paid faster.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center">

          <Link to="/generate">
            <button className="btn-font bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition">
              Generate Your First Invoice
            </button>
          </Link>

          <a href="#learn-more">
            <button className="btn-font border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-base font-semibold rounded-full transition">
              Learn More
            </button>
          </a>

        </div>

      </div>
    </main>
  )
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col font-[Inter]">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-3">
            <img src={logoImage} alt="OMNICASSION" className="h-10" />
            <span className="heading text-2xl font-extrabold tracking-tight text-gray-900">
              QuickInvoice
            </span>
          </Link>

          <nav className="flex items-center gap-10 text-sm">
            <Link to="/" className="text-gray-600 hover:text-blue-600 transition">
              Home
            </Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition">
              Dashboard
            </Link>
            <Link to="/generate" className="text-gray-600 hover:text-blue-600 transition">
              Generate
            </Link>

            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </nav>

        </div>
      </header>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/generate" element={<div className="p-6"><Generate /></div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </div>
  )
}
