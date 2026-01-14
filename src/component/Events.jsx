import React, { useState, useEffect } from "react"
import { Calendar, Plus, Trash2, Edit2, X, Mail, Phone, Tag } from "lucide-react"
import { getEvents, saveEvent, deleteEvent, formatDate } from "../utils/eventStorage"
import toast from "react-hot-toast"

export default function Events() {
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  
  // Form state
  const [eventName, setEventName] = useState("")
  const [eventType, setEventType] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [eventId, setEventId] = useState("")

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = () => {
    const data = getEvents()
    data.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    setEvents(data)
  }

  const generateEventId = () => {
    const year = new Date().getFullYear().toString().slice(-2)
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `EVT/${year}-${month}/${random}`
  }

  const handleOpenForm = (event = null) => {
    if (event) {
      setEditingEvent(event)
      setEventName(event.eventName || "")
      setEventType(event.eventType || "")
      setEventDate(event.eventDate || "")
      setClientEmail(event.clientEmail || "")
      setClientPhone(event.clientPhone || "")
      setEventId(event.eventId || "")
    } else {
      setEditingEvent(null)
      setEventName("")
      setEventType("")
      setEventDate("")
      setClientEmail("")
      setClientPhone("")
      setEventId(generateEventId())
    }
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingEvent(null)
    setEventName("")
    setEventType("")
    setEventDate("")
    setClientEmail("")
    setClientPhone("")
    setEventId("")
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!eventName || !eventType || !eventDate || !clientEmail || !clientPhone) {
      toast.error("Please fill in all fields")
      return
    }

    const eventData = {
      eventId: editingEvent ? editingEvent.eventId : eventId,
      eventName,
      eventType,
      eventDate,
      clientEmail,
      clientPhone
    }

    saveEvent(eventData)
    toast.success(editingEvent ? "Event updated successfully" : "Event created successfully")
    loadEvents()
    handleCloseForm()
  }

  const handleDelete = (id) => {
    if (window.confirm("Delete this event?")) {
      deleteEvent(id)
      toast.success("Event deleted")
      loadEvents()
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="text-blue-600" />
              Events
            </h1>
            <p className="text-gray-500 mt-2">
              {events.length} event{events.length !== 1 ? "s" : ""} created
            </p>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
          >
            <Plus size={20} />
            New Event
          </button>
        </div>

        {/* Event Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingEvent ? "Edit Event" : "Create New Event"}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event ID <span className="text-gray-400">(Auto-generated)</span>
                  </label>
                  <input
                    type="text"
                    value={eventId}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g., Sharma Wedding Reception"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Event Type</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Birthday Party">Birthday Party</option>
                    <option value="Corporate Event">Corporate Event</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Haldi Ceremony">Haldi Ceremony</option>
                    <option value="Mehendi Ceremony">Mehendi Ceremony</option>
                    <option value="Reception">Reception</option>
                    <option value="Baby Shower">Baby Shower</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Client Email ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+91-1234567890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    {editingEvent ? "Update Event" : "Create Event"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Events List */}
        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Events Yet</h3>
            <p className="text-gray-500 mb-6">Create your first event to get started</p>
            <button
              onClick={() => handleOpenForm()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Create Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl border overflow-hidden transition group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {event.eventType}
                      </span>
                      <p className="text-xs text-gray-500 mt-2 font-mono">#{event.eventId}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleOpenForm(event)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 mb-4">
                    {event.eventName}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>{formatDate(event.eventDate)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-green-600" />
                      <span className="truncate">{event.clientEmail}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-purple-600" />
                      <span>{event.clientPhone}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


