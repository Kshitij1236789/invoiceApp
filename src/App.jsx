import React from "react"
import { Link, Routes, Route, Navigate } from "react-router-dom"
import { FileText } from "lucide-react"
import Dashboard from "./component/dashboard"
import Generate from "./component/generate"
import Sidebar from "./component/Sidebar"
import Events from "./component/Events"
import Requirements from "./component/Requirements"
import Quotation from "./component/Quotation"
import Invoices from "./component/Invoices"
import logoImage from "./assets/omnicassion-logo.avif"

function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center px-6 py-20">
      <div className="max-w-5xl text-center">

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
          Effortless Invoicing.
          <br /> Professional Results.
        </h1>

        <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto">
          Stop wrestling with spreadsheets. QuickInvoice helps you create and send beautiful invoices in minutes —
          so you get paid faster.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center">

          <Link to="/generate">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition">
              Generate Your First Invoice
            </button>
          </Link>

          <Link to="/dashboard">
            <button className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-base font-semibold rounded-full transition">
              Learn More
            </button>
          </Link>

        </div>

      </div>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Home page - no sidebar, clean header */}
      <Route path="/" element={
        <div className="min-h-screen font-[Inter]">
          <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4 flex items-center">
              <Link to="/" className="flex items-center gap-3">
                <img src={logoImage} alt="OMNICASSION" className="h-10" />
                <span className="heading text-2xl font-extrabold tracking-tight text-gray-900">
                  QuickInvoice
                </span>
              </Link>
            </div>
          </header>
          <Home />
        </div>
      } />

      {/* Pages with sidebar */}
      <Route path="*" element={
        <div className="min-h-screen flex font-[Inter]">
          <Sidebar />
          <div className="flex-1 lg:ml-64">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events" element={<Events />} />
              <Route path="/requirements" element={<Requirements />} />
              <Route path="/quotation" element={<Quotation />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/generate" element={<div className="p-6"><Generate /></div>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      } />
    </Routes>
  )
}
