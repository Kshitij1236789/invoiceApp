import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus, Trash2, FileText, Calendar, MapPin, User, Tag } from "lucide-react"
import { getInvoices, deleteInvoice, formatDate } from "../utils/invoiceStorage"
import toast from "react-hot-toast"

export default function Dashboard() {
  const [invoices, setInvoices] = useState([])

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = () => {
    const data = getInvoices()
    data.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    setInvoices(data)
  }

  const handleDelete = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm("Delete this invoice?")) {
      deleteInvoice(id)
      toast.success("Invoice deleted")
      loadInvoices()
    }
  }

  const getTitle = (inv) => {
    if (inv.eventName) return inv.eventName
    if (inv.issuedTo) return inv.issuedTo
    return inv.invoiceNumber
  }

  const formatEventDate = (dateString) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      })
    } catch (error) {
      return dateString
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-4xl font-bold text-gray-900">Invoice Dashboard</h1>
          <Link to="/generate">
            <button className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition shadow-md hover:shadow-lg">
              <Plus size={20} />
              Create New Invoice
            </button>
          </Link>
        </div>
        <p className="text-gray-500">
          {invoices.length === 0 
            ? "No invoices yet. Create your first invoice to get started!"
            : `You have ${invoices.length} saved invoice${invoices.length !== 1 ? 's' : ''}`
          }
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

      

        {/* Invoice Cards */}
        {invoices.map((invoice) => (
          <div key={invoice.id} className="relative group">
            <Link to={`/generate?id=${invoice.id}`}>
              <div className="h-[420px] bg-white rounded-2xl shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border overflow-hidden flex flex-col">

                {/* Header with Invoice Type Badge */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex justify-between items-center">
                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                    {invoice.invoiceType || "Invoice"}
                  </span>
                  <span className="text-xs font-mono text-blue-100 bg-blue-800/30 px-2 py-1 rounded">
                    #{invoice.invoiceNumber}
                  </span>
                </div>

                {/* Invoice Preview */}
                <div className="h-[180px] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border-b relative">
                  <div className="w-[80%] h-[85%] bg-white border rounded-lg shadow-inner p-3 flex flex-col justify-between">
                    <div className="flex-1 flex items-center justify-center">
                      <FileText className="w-10 h-10 text-gray-300" />
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-lg font-bold text-center py-2 rounded border border-blue-200">
                      ₹ {invoice.grandTotal?.toLocaleString('en-IN') || '0'}
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="flex-1 p-4 space-y-3">
                  {/* Event Name */}
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg truncate mb-1">
                      {invoice.eventName || invoice.issuedTo || 'Untitled Event'}
                    </h3>
                    {invoice.eventType && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Tag size={12} />
                        <span>{invoice.eventType}</span>
                      </div>
                    )}
                  </div>

                  {/* Event Details Grid */}
                  <div className="space-y-2">
                    {invoice.eventDate && (
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 truncate">
                          {formatEventDate(invoice.eventDate)}
                        </span>
                      </div>
                    )}
                    
                    {invoice.eventVenue && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 truncate">
                          {invoice.eventVenue}
                        </span>
                      </div>
                    )}

                    {invoice.issuedTo && !invoice.eventName && (
                      <div className="flex items-start gap-2 text-sm">
                        <User className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 truncate">
                          {invoice.issuedTo}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer Info */}
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Updated: {formatDate(invoice.lastUpdated)}
                    </p>
                  </div>
                </div>

              </div>
            </Link>

            {/* Delete Button */}
            <button
              onClick={(e) => handleDelete(e, invoice.id)}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
              title="Delete invoice"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

    </main>
  )
}
