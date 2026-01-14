import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { Upload, Plus, Trash2, Download, Save } from 'lucide-react';
import { generateInvoicePDF } from './pdf-generator';
import { saveInvoice, getInvoiceById } from '../utils/invoiceStorage';
import toast from 'react-hot-toast';
import logoImage from '../assets/omnicassion-logo.avif';
import QRCode from 'qrcode';

// Function to convert image URL to base64 with better AVIF support
const imageToBase64 = (imagePath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // Set canvas size to a reasonable size for PDF
        const maxWidth = 200;
        const maxHeight = 80;
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to PNG format for better PDF compatibility
        const dataUrl = canvas.toDataURL('image/png', 0.9);
        console.log('Logo converted successfully to base64');
        resolve(dataUrl);
      } catch (e) {
        console.error('Failed to convert logo to canvas:', e);
        reject(e);
      }
    };
    img.onerror = (e) => {
      console.error('Failed to load logo image:', e);
      reject(e);
    };
    img.src = imagePath;
  });
};

export default function EventInvoiceGenerator() {
  // Logo and QR Code (pre-loaded)
  const logo = logoImage;
  const [qrCode, setQrCode] = useState('');
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get("id");
  const isViewMode = !!invoiceId;
  const [isEditing, setIsEditing] = useState(false);
  const isReadOnly = isViewMode && !isEditing;



  // Auto-generate invoice number
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `OMNI/${year}-${month}/${random}`;
  };

  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [invoiceType, setInvoiceType] = useState('QUOTATION'); // Can be QUOTATION or FINAL QUOTATION
  const [dateIssued, setDateIssued] = useState('');
  const [vendorName, setVendorName] = useState('omnicassion');
  const [contactEmail, setContactEmail] = useState('omnicassion@gmail.com');
  const [contactPhone1, setContactPhone1] = useState('+91-6284598500');
  const [contactPhone2, setContactPhone2] = useState('+91 9988777462');
  const [website, setWebsite] = useState('omnicassion.com');


  useEffect(() => {
    if (!invoiceId) return;

    const invoice = getInvoiceById(invoiceId);
    if (!invoice || !invoice.fullData) return;

    const d = invoice.fullData;

    setInvoiceNumber(d.invoiceNumber || "");
    setInvoiceType(d.invoiceType || "");
    setDateIssued(d.dateIssued || "");
    setIssuedTo(d.issuedTo || "");

    setEventName(d.eventName || "");
    setEventType(d.eventType || "");
    setEventDate(d.eventDate || "");
    setEventVenue(d.eventVenue || "");
    setEventGuests(d.eventGuests || "");

    setItems(d.items || []);
    setSiteCharges(d.siteCharges || 0);
    setDiscount(d.discount || 0);
    setTokenMoneyPaid(d.tokenMoneyPaid || 0);
    setSecondInstallment(d.secondInstallment || 0);
    setTotalCost(d.totalCost || 0);

  }, [invoiceId]);


  // Generate QR code that links to the website for this invoice
  useEffect(() => {
    const generateQr = async () => {
      try {
        const baseUrl = website?.startsWith('http') ? website : `https://${website}`;
        const urlWithInvoice = `${baseUrl.replace(/\/$/, '')}?invoice=${encodeURIComponent(invoiceNumber)}`;
        const dataUrl = await QRCode.toDataURL(urlWithInvoice, {
          width: 160,
          margin: 1,
        });
        setQrCode(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };



    generateQr();
  }, [website, invoiceNumber]);

  // Client Details
  const [issuedTo, setIssuedTo] = useState('');

  // Event Details
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventGuests, setEventGuests] = useState('');

  // Line Items
  const [items, setItems] = useState([
    { id: 1, service: '', quantity: 1, price: 0, total: 0 }
  ]);

  // Additional Charges
  const [siteCharges, setSiteCharges] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tokenMoneyPaid, setTokenMoneyPaid] = useState(0);
  const [secondInstallment, setSecondInstallment] = useState(0);

  // Cost tracking for profit calculation
  const [totalCost, setTotalCost] = useState(0); // Your actual expenses

  // Bank Details
  const [bankName, setBankName] = useState('HDFC BANK');
  const [accountNo, setAccountNo] = useState('50100570331614');
  const [accountName, setAccountName] = useState('ADITYA');

  const addItem = () => {
    setItems([...items, { id: Date.now(), service: '', quantity: 1, price: 0, total: 0 }]);
  };

  const updateItem = (id, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          updated.total = updated.quantity * updated.price;
        }
        return updated;
      }
      return item;
    });
    setItems(updatedItems);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + siteCharges - discount;
  };

  const calculateProfit = () => {
    return calculateGrandTotal() - totalCost;
  };

  const calculateProfitMargin = () => {
    const total = calculateGrandTotal();
    if (total === 0) return 0;
    return ((calculateProfit() / total) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT PANEL - Service Entry Form */}
          <div className="lg:col-span-1 space-y-4">

            {/* Invoice Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Invoice Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Invoice Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={invoiceType}
                    onChange={(e) => setInvoiceType(e.target.value)}
                  >
                    <option value="QUOTATION">Quotation</option>
                    <option value="FINAL QUOTATION">Final Quotation</option>
                    <option value="INVOICE">Invoice</option>
                    <option value="PROFORMA INVOICE">Proforma Invoice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                    value={invoiceNumber}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date Issued</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={dateIssued}
                    onChange={(e) => setDateIssued(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Issued To</label>
                  <input
                    type="text"
                    placeholder="Mr. Umang Chhabra"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={issuedTo}
                    onChange={(e) => setIssuedTo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Event Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Event Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Sharma Wedding Reception"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Event Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                  >
                    <option value="">Select Type</option>
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
                  <label className="block text-sm text-gray-600 mb-1">Event Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Venue</label>
                  <input
                    type="text"
                    placeholder="Event venue location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventVenue}
                    onChange={(e) => setEventVenue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Expected Guests</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Number of guests"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventGuests}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setEventGuests(value);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Services</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <textarea
                      placeholder="Service description (e.g., Haldi decor backdrop, presage, fillers, entry gate, hamri, chamunda...)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      rows="2"
                      value={item.service}
                      onChange={(e) => updateItem(item.id, 'service', e.target.value)}
                    />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">Qty</label>
                        <input
                          disabled={isReadOnly}
                          type="text"
                          inputMode="numeric"
                          className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            updateItem(item.id, 'quantity', parseFloat(value) || 0);
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">Price (Rs)</label>
                        <input
                          disabled={isReadOnly}
                          type="text"
                          inputMode="numeric"
                          className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={item.price}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            updateItem(item.id, 'price', parseFloat(value) || 0);
                          }}
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right text-sm font-medium text-gray-700">
                      Total: ₹{item.total.toLocaleString()}
                    </div>
                  </div>
                ))}
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Plus size={16} />
                  Add Service
                </button>
              </div>
            </div>

            {/* Additional Charges */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Additional Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Site Charges (Rs)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={siteCharges}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setSiteCharges(parseFloat(value) || 0);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Discount (Rs)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={discount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setDiscount(parseFloat(value) || 0);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Token Money Paid</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={tokenMoneyPaid}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setTokenMoneyPaid(parseFloat(value) || 0);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Second Installment</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={secondInstallment}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setSecondInstallment(parseFloat(value) || 0);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Cost & Profit Tracking */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Cost & Profit Analysis</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Total Cost/Expenses (Rs)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Your actual expenses for this event"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={totalCost}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setTotalCost(parseFloat(value) || 0);
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter your total expenses (vendors, materials, labor, etc.)</p>
                </div>

                {/* Profit Display */}
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Revenue:</span>
                      <span className="text-lg font-bold text-blue-600">₹{calculateGrandTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Cost:</span>
                      <span className="text-lg font-bold text-orange-600">₹{totalCost.toLocaleString()}</span>
                    </div>
                    <div className="border-t-2 border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-800">Net Profit:</span>
                        <span className={`text-xl font-bold ${calculateProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{calculateProfit().toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-600">Profit Margin:</span>
                        <span className={`text-sm font-semibold ${calculateProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {calculateProfitMargin()}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex gap-3">

                {/* CREATE MODE */}
                {!isViewMode && (
                  <>
                    <button
                      onClick={async () => {
                        try {
                          let logoBase64 = null;
                          try {
                            console.log('Converting logo to base64...');
                            logoBase64 = await imageToBase64(logo);
                            console.log('Logo converted successfully, length:', logoBase64.length);
                          } catch (e) {
                            console.warn('Could not load logo for PDF:', e);
                            console.log('Logo path was:', logo);
                          }

                          const invoiceData = {
                            invoiceNumber,
                            invoiceType,
                            dateIssued,
                            issuedTo,
                            eventName,
                            eventType,
                            eventDate,
                            eventVenue,
                            eventGuests,
                            items,
                            siteCharges,
                            discount,
                            tokenMoneyPaid,
                            secondInstallment,
                            totalCost,
                            logo: logoBase64,
                            qrCode: qrCode,
                            vendorName,
                            contactEmail,
                            contactPhone1,
                            contactPhone2,
                            website,
                            bankName,
                            accountNo,
                            accountName
                          };

                          await generateInvoicePDF(invoiceData);
                          saveInvoice(invoiceData);
                          toast.success("Invoice downloaded and saved!");
                        } catch {
                          toast.error("PDF generation failed");
                        }
                      }}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                      Download PDF
                    </button>

                    <button
                      onClick={() => window.location.href = "/generate"}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                      New Invoice
                    </button>
                  </>
                )}

                {/* VIEW MODE */}
                {isViewMode && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-md"
                  >
                    Edit Invoice
                  </button>
                )}

                {/* EDIT MODE */}
                {isViewMode && isEditing && (
                  <button
                    onClick={() => {
                      const updatedInvoice = {
                        invoiceNumber,
                        invoiceType,
                        dateIssued,
                        issuedTo,
                        eventName,
                        eventType,
                        eventDate,
                        eventVenue,
                        eventGuests,
                        items,
                        siteCharges,
                        discount,
                        tokenMoneyPaid,
                        secondInstallment,
                        totalCost
                      };

                      saveInvoice(updatedInvoice);
                      toast.success("Invoice updated successfully");
                      setIsEditing(false);
                    }}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md"
                  >
                    Save Changes
                  </button>
                )}

              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Invoice Preview */}
          <div className="lg:col-span-2">

            {/* Invoice Preview */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-black">

              {/* Header with Logo and QR */}
              <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-black">
                <div>
                  <img src={logo} alt="Company Logo" className="h-12 mb-2" />
                  <p className="text-xs font-semibold">Event Management Platform</p>
                  <p className="text-xs text-gray-600">All types of vendors and services related to your event are provided here</p>
                </div>
                <div className="text-right">
                  <img src={qrCode} alt="QR Code" className="w-16 h-16 ml-auto mb-2" />
                </div>
              </div>

              {/* Top Row - Title Left, Invoice Number Right */}
              <div className="flex justify-between items-start mb-6">
                {/* Left Side - Title */}
                <h1 className="text-3xl font-bold">{invoiceType}</h1>

                {/* Right Side - Invoice Number in Box */}
                <div className="border-2 border-black px-4 py-2">
                  <span className="text-sm font-semibold">{invoiceNumber}</span>
                </div>
              </div>

              {/* Three Column Layout - Date, Vendor, Contact */}
              <div className="grid grid-cols-3 gap-8 mb-6 text-sm">
                {/* Left Column */}
                <div>
                  <p className="font-semibold mb-1">Date Issued:</p>
                  <p className="mb-4">{dateIssued || '28-09-2025'}</p>
                  <p className="font-semibold mb-1">Issued to:</p>
                  <p>{issuedTo || 'Mr. Umang Chhabra'}</p>
                </div>

                {/* Middle Column */}
                <div>
                  <p className="font-semibold mb-1">Vendor name:</p>
                  <p>{vendorName}</p>
                </div>

                {/* Right Column - Contact Info */}
                <div className="text-right">
                  <p className="font-semibold mb-1">Contact Info:</p>
                  <p className="text-xs">{contactEmail}</p>
                  <p className="text-xs">{contactPhone1}, {contactPhone2}</p>
                  <p className="text-xs">{website}</p>
                </div>
              </div>

              {/* Services Table */}
              <table className="w-full mb-6 border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="text-left px-3 py-2 text-sm font-semibold border-r border-gray-400">SERVICE</th>
                    <th className="text-center px-3 py-2 text-sm font-semibold border-r border-gray-400">QTY</th>
                    <th className="text-right px-3 py-2 text-sm font-semibold border-r border-gray-400">PRICE</th>
                    <th className="text-right px-3 py-2 text-sm font-semibold">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-300">
                      <td className="px-3 py-3 text-xs border-r border-gray-300">{item.service || 'Service description'}</td>
                      <td className="px-3 py-3 text-center text-sm border-r border-gray-300">{item.quantity}</td>
                      <td className="px-3 py-3 text-right text-sm border-r border-gray-300">{item.price.toLocaleString()} Rs</td>
                      <td className="px-3 py-3 text-right text-sm font-medium">{item.total.toLocaleString()} Rs</td>
                    </tr>
                  ))}

                  {/* Empty rows for spacing */}
                  {Array(Math.max(0, 3 - items.length)).fill(0).map((_, i) => (
                    <tr key={`empty-${i}`} className="border-b border-gray-300">
                      <td className="px-3 py-3 text-xs border-r border-gray-300">&nbsp;</td>
                      <td className="px-3 py-3 text-center text-sm border-r border-gray-300">&nbsp;</td>
                      <td className="px-3 py-3 text-right text-sm border-r border-gray-300">&nbsp;</td>
                      <td className="px-3 py-3 text-right text-sm">&nbsp;</td>
                    </tr>
                  ))}

                  {/* Site Charges */}
                  <tr className="border-b border-gray-300">
                    <td colSpan="2" className="px-3 py-2 text-sm border-r border-gray-300">Site Charges</td>
                    <td className="px-3 py-2 text-right text-sm border-r border-gray-300">{siteCharges} rs</td>
                    <td className="px-3 py-2 text-right text-sm font-medium">{siteCharges} Rs</td>
                  </tr>

                  {/* Subtotal - Light gray background, bold text */}
                  <tr className="border-b border-gray-300 bg-gray-100">
                    <td colSpan="3" className="px-3 py-2 text-right font-bold border-r border-gray-300">SUBTOTAL</td>
                    <td className="px-3 py-2 text-right font-bold">{calculateSubtotal().toLocaleString()} Rs</td>
                  </tr>

                  {/* Discount */}
                  <tr className="border-b border-gray-300">
                    <td colSpan="3" className="px-3 py-2 text-right font-semibold border-r border-gray-300">DISCOUNT</td>
                    <td className="px-3 py-2 text-right font-semibold">{discount} rs</td>
                  </tr>

                  {/* Grand Total - Black background, white text, bold */}
                  <tr className="bg-black text-white border-b border-gray-300">
                    <td colSpan="3" className="px-3 py-3 text-right font-bold border-r border-gray-400">GRAND TOTAL</td>
                    <td className="px-3 py-3 text-right font-bold">{calculateGrandTotal().toLocaleString()} Rs</td>
                  </tr>

                  {/* Token Money Paid */}
                  <tr className="border-b border-gray-300">
                    <td colSpan="3" className="px-3 py-2 text-right border-r border-gray-300">TOKEN MONEY PAID</td>
                    <td className="px-3 py-2 text-right">{tokenMoneyPaid.toLocaleString()}</td>
                  </tr>

                  {/* Second Installment */}
                  <tr className="border-b border-gray-300">
                    <td colSpan="3" className="px-3 py-2 text-right border-r border-gray-300">SECOND INSTALLMENT</td>
                    <td className="px-3 py-2 text-right">{secondInstallment.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              {/* Bank Details */}
              <div className="mb-8 mt-6 p-5 bg-gray-50 rounded">
                <p className="font-bold text-sm mb-3">Company Bank Detail:</p>
                <p className="text-sm mb-2">Bank Name: {bankName}</p>
                <p className="text-sm mb-2">Account No: {accountNo}</p>
                <p className="text-sm">Account Name: {accountName}</p>
              </div>

              {/* Footer */}
              <div className="border-t-2 border-black pt-4 text-center">
                <p className="text-xs mb-1">Visit our website <span className="font-semibold">www.omnicassion.com</span> to get access to our services.</p>
                <p className="text-lg font-bold">JUST SIT BACK AND ENJOY</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}