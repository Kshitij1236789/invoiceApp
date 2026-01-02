// Utility functions for storing and retrieving invoices from localStorage

const STORAGE_KEY = 'saved_invoices';

export const saveInvoice = (invoiceData) => {
  try {
    const invoices = getInvoices();
    const invoice = {
      id: invoiceData.invoiceNumber || `INV-${Date.now()}`,
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceType: invoiceData.invoiceType,
      dateIssued: invoiceData.dateIssued,
      issuedTo: invoiceData.issuedTo,
      eventName: invoiceData.eventName,
      eventType: invoiceData.eventType,
      eventDate: invoiceData.eventDate,
      eventVenue: invoiceData.eventVenue,
      grandTotal: calculateGrandTotal(invoiceData),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      // Store full invoice data for viewing/editing
      fullData: invoiceData
    };
    
    // Check if invoice with same number already exists
    const existingIndex = invoices.findIndex(inv => inv.invoiceNumber === invoice.invoiceNumber);
    
    if (existingIndex >= 0) {
      // Update existing invoice
      invoices[existingIndex] = { ...invoices[existingIndex], ...invoice };
    } else {
      // Add new invoice
      invoices.push(invoice);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
    return invoice;
  } catch (error) {
    console.error('Error saving invoice:', error);
    throw error;
  }
};

export const getInvoices = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving invoices:', error);
    return [];
  }
};

export const getInvoiceById = (id) => {
  try {
    const invoices = getInvoices();
    return invoices.find(inv => inv.id === id || inv.invoiceNumber === id);
  } catch (error) {
    console.error('Error retrieving invoice:', error);
    return null;
  }
};

export const deleteInvoice = (id) => {
  try {
    const invoices = getInvoices();
    const filtered = invoices.filter(inv => inv.id !== id && inv.invoiceNumber !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return false;
  }
};

const calculateGrandTotal = (data) => {
  const subtotal = data.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  return subtotal + (data.siteCharges || 0) - (data.discount || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  } catch (error) {
    return dateString;
  }
};



