import React, { useState, useEffect } from "react"
import { FileText, Plus, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import { getInvoices, deleteInvoice, formatDate } from "../utils/invoiceStorage"
import toast from "react-hot-toast"

export default function Quotation() {
  const [quotations, setQuotations] = useState([])

  useEffect(() => {
    loadQuotations()
  }, [])

  const loadQuotations = () => {
    const allInvoices = getInvoices()
    // Filter for quotations only
    const quotes = allInvoices.filter(
      inv => inv.invoiceType === "QUOTATION" || inv.invoiceType === "FINAL QUOTATION"
    )
    quotes.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    setQuotations(quotes)
  }

  const handleDelete = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm("Delete this quotation?")) {
      deleteInvoice(id)
      toast.success("Quotation deleted")
      loadQuotations()
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="text-blue-600" />
              Quotations
            </h1>
            <p className="text-gray-500 mt-2">
              {quotations.length} quotation{quotations.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link to="/generate">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2">
              <Plus size={20} />
              New Quotation
            </button>
          </Link>
        </div>

        {quotations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Quotations Yet</h3>
            <p className="text-gray-500 mb-6">Create your first quotation</p>
            <Link to="/generate">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
                Create Quotation
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quotations.map((quote) => (
              <div key={quote.id} className="relative group bg-white rounded-lg shadow-md hover:shadow-xl border overflow-hidden">
                <Link to={`/generate?id=${quote.id}`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {quote.invoiceType}
                        </span>
                        <p className="text-sm text-gray-500 mt-2">#{quote.invoiceNumber}</p>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">
                      {quote.eventName || quote.issuedTo || "Untitled"}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      {quote.eventDate && <p>📅 {quote.eventDate}</p>}
                      {quote.eventVenue && <p>📍 {quote.eventVenue}</p>}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="text-lg font-bold text-blue-600">
                        ₹ {quote.grandTotal?.toLocaleString("en-IN") || "0"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(quote.lastUpdated)}
                      </span>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={(e) => handleDelete(e, quote.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



