import React, { useState, useEffect } from "react"
import { Receipt, Plus, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import { getInvoices, deleteInvoice, formatDate } from "../utils/invoiceStorage"
import toast from "react-hot-toast"

export default function Invoices() {
  const [invoices, setInvoices] = useState([])

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = () => {
    const allInvoices = getInvoices()
    // Filter for invoices only (not quotations)
    const invs = allInvoices.filter(
      inv => inv.invoiceType === "INVOICE" || inv.invoiceType === "PROFORMA INVOICE"
    )
    invs.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    setInvoices(invs)
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

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Receipt className="text-blue-600" />
              Invoices
            </h1>
            <p className="text-gray-500 mt-2">
              {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link to="/generate">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2">
              <Plus size={20} />
              New Invoice
            </button>
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Invoices Yet</h3>
            <p className="text-gray-500 mb-6">Create your first invoice</p>
            <Link to="/generate">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
                Create Invoice
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="relative group bg-white rounded-lg shadow-md hover:shadow-xl border overflow-hidden">
                <Link to={`/generate?id=${invoice.id}`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                          {invoice.invoiceType}
                        </span>
                        <p className="text-sm text-gray-500 mt-2">#{invoice.invoiceNumber}</p>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">
                      {invoice.eventName || invoice.issuedTo || "Untitled"}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      {invoice.eventDate && <p>📅 {invoice.eventDate}</p>}
                      {invoice.eventVenue && <p>📍 {invoice.eventVenue}</p>}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="text-lg font-bold text-green-600">
                        ₹ {invoice.grandTotal?.toLocaleString("en-IN") || "0"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(invoice.lastUpdated)}
                      </span>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={(e) => handleDelete(e, invoice.id)}
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



