import React, { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  ClipboardList, 
  Receipt, 
  Plus,
  Menu,
  X
} from "lucide-react"

export default function Sidebar() {
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard"
    },
    {
      name: "Events",
      icon: Calendar,
      path: "/events"
    },
    {
      name: "Requirements Sheet",
      icon: ClipboardList,
      path: "/requirements"
    },
    {
      name: "Quotation",
      icon: FileText,
      path: "/quotation"
    },
    {
      name: "Invoices",
      icon: Receipt,
      path: "/invoices"
    }
  ]

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md border"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">QuickInvoice</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${active
                      ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon size={20} className={active ? "text-blue-600" : "text-gray-500"} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Create Invoice Button */}
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/generate"
              onClick={() => setIsMobileOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              <span>Create Invoice</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}



