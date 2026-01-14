const STORAGE_KEY = "saved_invoices";

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
      lastUpdated: new Date().toISOString(),

      // FULL FORM DATA
      fullData: invoiceData
    };

    const index = invoices.findIndex(
      inv => inv.invoiceNumber === invoice.invoiceNumber
    );

    if (index >= 0) {
      invoices[index] = {
        ...invoices[index],
        ...invoice,
        fullData: invoiceData,
        lastUpdated: new Date().toISOString()
      };
    } else {
      invoices.push(invoice);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
    return invoice;
  } catch (e) {
    console.error("Save failed", e);
    return null;
  }
};

export const getInvoices = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getInvoiceById = (id) => {
  const invoices = getInvoices();
  return invoices.find(
    inv => inv.id === id || inv.invoiceNumber === id
  );
};

export const deleteInvoice = (id) => {
  const invoices = getInvoices().filter(
    inv => inv.id !== id && inv.invoiceNumber !== id
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
};

const calculateGrandTotal = (data) => {
  const subtotal = data.items?.reduce(
    (sum, i) => sum + (i.total || 0),
    0
  ) || 0;

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
