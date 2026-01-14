import React from "react"
import { ClipboardList, Plus } from "lucide-react"
import { Link } from "react-router-dom"

export default function Requirements() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <ClipboardList className="text-blue-600" />
              Requirements Sheet
            </h1>
            <p className="text-gray-500 mt-2">Track client requirements and specifications</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2">
            <Plus size={20} />
            New Requirements
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Requirements Sheets Yet</h3>
          <p className="text-gray-500 mb-6">Create a requirements sheet to track client needs</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
            Create Requirements Sheet
          </button>
        </div>
      </div>
    </div>
  )
}



