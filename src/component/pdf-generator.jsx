import jsPDF from "jspdf"

export async function generateInvoicePDF(data) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10
  let yPos = margin

  // Helper function to add text with word wrap
  const addText = (text, x, y, maxWidth, fontSize = 10, align = 'left') => {
    pdf.setFontSize(fontSize)
    const lines = pdf.splitTextToSize(text, maxWidth)
    pdf.text(lines, x, y, { align })
    return y + (lines.length * fontSize * 0.4)
  }

  // Header with Logo and QR Code area
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.5)
  
  // Logo placeholder (left)
  pdf.rect(margin, yPos, 40, 15)
  addText('OMNICASSION', margin + 2, yPos + 8, 35, 12, 'left')
  addText('Event Management Platform', margin + 2, yPos + 12, 35, 8, 'left')
  
  // QR Code on the right - use generated QR if available, otherwise placeholder
  const qrSize = 20
  const qrX = pageWidth - margin - qrSize
  if (data.qrCode) {
    try {
      pdf.addImage(data.qrCode, 'PNG', qrX, yPos, qrSize, qrSize)
    } catch (e) {
      console.error('Failed to add QR image to PDF:', e)
      pdf.rect(qrX, yPos, qrSize, qrSize)
      addText('QR', qrX + qrSize / 2, yPos + qrSize / 2 + 2, 15, 10, 'center')
    }
  } else {
    pdf.rect(qrX, yPos, qrSize, qrSize)
    addText('QR', qrX + qrSize / 2, yPos + qrSize / 2 + 2, 15, 10, 'center')
  }
  
  yPos += 25

  // Horizontal line
  pdf.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 5

  // Top Row: Invoice Type on extreme left, Invoice Number in box on extreme right
  pdf.setFontSize(20)
  pdf.setFont(undefined, 'bold')
  const invoiceTypeText = data.invoiceType || 'QUOTATION'
  pdf.text(invoiceTypeText, margin, yPos)
  
  // Invoice Number in black border box on right
  pdf.setFontSize(10)
  pdf.setFont(undefined, 'normal')
  const invoiceNumText = data.invoiceNumber || ''
  const numWidth = pdf.getTextWidth(invoiceNumText)
  const boxPadding = 4
  const boxWidth = numWidth + (boxPadding * 2)
  const boxX = pageWidth - margin - boxWidth
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.5)
  pdf.rect(boxX, yPos - 3, boxWidth, 8)
  pdf.text(invoiceNumText, boxX + boxPadding, yPos + 2)
  
  yPos += 12

  // Three Column Layout: Date Issued (left), Vendor (middle), Contact Info (right)
  pdf.setFontSize(9)
  const col1X = margin
  const col2X = margin + 70
  const col3X = pageWidth - margin - 60
  
  // Left Column - Date Issued
  pdf.setFont(undefined, 'bold')
  pdf.text('Date Issued:', col1X, yPos)
  pdf.setFont(undefined, 'normal')
  pdf.text(data.dateIssued || 'N/A', col1X, yPos + 5)
  
  // Middle Column - Vendor name
  pdf.setFont(undefined, 'bold')
  pdf.text('Vendor name:', col2X, yPos)
  pdf.setFont(undefined, 'normal')
  pdf.text(data.vendorName || 'omnicassion', col2X, yPos + 5)
  
  // Right Column - Contact Info (right-aligned)
  pdf.setFont(undefined, 'bold')
  pdf.text('Contact Info:', col3X, yPos, { align: 'right' })
  pdf.setFont(undefined, 'normal')
  pdf.setFontSize(8)
  pdf.text(data.contactEmail || '', col3X, yPos + 4, { align: 'right' })
  pdf.text(`${data.contactPhone1 || ''}, ${data.contactPhone2 || ''}`, col3X, yPos + 7, { align: 'right' })
  pdf.text(data.website || '', col3X, yPos + 10, { align: 'right' })
  
  yPos += 15

  // Issued To (below Date Issued in left column)
  pdf.setFontSize(10)
  pdf.setFont(undefined, 'bold')
  pdf.text('Issued to:', col1X, yPos)
  pdf.setFont(undefined, 'normal')
  pdf.text(data.issuedTo || 'N/A', col1X, yPos + 5)
  yPos += 10

  // Calculate column positions for grid lines
  const col1End = margin + 90  // SERVICE column end
  const col2End = margin + 115 // QTY column end
  const col3End = margin + 145 // PRICE column end
  
  // Services Table Header
  pdf.setFillColor(0, 0, 0)
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(9)
  pdf.setFont(undefined, 'bold')
  
  pdf.text('SERVICE', margin + 2, yPos + 5)
  pdf.text('QTY', margin + 100, yPos + 5, { align: 'center' })
  pdf.text('PRICE', margin + 130, yPos + 5, { align: 'right' })
  pdf.text('TOTAL', pageWidth - margin - 2, yPos + 5, { align: 'right' })
  
  // Draw vertical grid lines in header
  pdf.setDrawColor(255, 255, 255)
  pdf.setLineWidth(0.3)
  pdf.line(col1End, yPos, col1End, yPos + 8)
  pdf.line(col2End, yPos, col2End, yPos + 8)
  pdf.line(col3End, yPos, col3End, yPos + 8)
  
  pdf.setTextColor(0, 0, 0)
  yPos += 8

  // Services Table Rows
  pdf.setFontSize(8)
  pdf.setFont(undefined, 'normal')
  pdf.setDrawColor(200, 200, 200) // Light gray for grid lines
  pdf.setLineWidth(0.2)
  
  data.items?.forEach((item, index) => {
    if (yPos > pageHeight - 30) {
      pdf.addPage()
      yPos = margin
    }
    
    const rowHeight = 7
    const rowTop = yPos
    
    // Draw horizontal grid line at top of row
    pdf.line(margin, rowTop, pageWidth - margin, rowTop)
    
    // Draw vertical grid lines
    pdf.line(col1End, rowTop, col1End, rowTop + rowHeight)
    pdf.line(col2End, rowTop, col2End, rowTop + rowHeight)
    pdf.line(col3End, rowTop, col3End, rowTop + rowHeight)
    
    const serviceText = item.service || 'Service description'
    const serviceLines = pdf.splitTextToSize(serviceText, 80)
    pdf.text(serviceLines[0] || '', margin + 2, rowTop + 4)
    pdf.text(String(item.quantity || 0), margin + 100, rowTop + 4, { align: 'center' })
    pdf.text(`${(item.price || 0).toLocaleString()} Rs`, margin + 130, rowTop + 4, { align: 'right' })
    pdf.text(`${(item.total || 0).toLocaleString()} Rs`, pageWidth - margin - 2, rowTop + 4, { align: 'right' })
    
    yPos += rowHeight
    if (serviceLines.length > 1) {
      pdf.line(margin, yPos, pageWidth - margin, yPos)
      pdf.text(serviceLines.slice(1).join(' '), margin + 2, yPos + 4)
      yPos += 4
    }
  })

  // Site Charges row
  pdf.setDrawColor(200, 200, 200)
  pdf.line(margin, yPos, pageWidth - margin, yPos)
  pdf.line(col1End, yPos, col1End, yPos + 6)
  pdf.line(col2End, yPos, col2End, yPos + 6)
  pdf.line(col3End, yPos, col3End, yPos + 6)
  yPos += 5
  pdf.text('Site Charges', margin + 2, yPos + 4)
  pdf.text(`${(data.siteCharges || 0).toLocaleString()} Rs`, pageWidth - margin - 2, yPos + 4, { align: 'right' })
  yPos += 6
  pdf.line(margin, yPos, pageWidth - margin, yPos)

  // Subtotal - Different styling with light gray background
  pdf.setFillColor(240, 240, 240)
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F')
  pdf.setDrawColor(200, 200, 200)
  pdf.line(col3End, yPos, col3End, yPos + 7)
  pdf.setFont(undefined, 'bold')
  pdf.setFontSize(9)
  pdf.text('SUBTOTAL', margin + 100, yPos + 5, { align: 'right' })
  const subtotal = data.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0
  pdf.text(`${subtotal.toLocaleString()} Rs`, pageWidth - margin - 2, yPos + 5, { align: 'right' })
  yPos += 7
  pdf.line(margin, yPos, pageWidth - margin, yPos)

  // Discount
  pdf.setDrawColor(200, 200, 200)
  pdf.line(col3End, yPos, col3End, yPos + 6)
  pdf.setFont(undefined, 'normal')
  pdf.text('DISCOUNT', margin + 100, yPos + 4, { align: 'right' })
  pdf.text(`${(data.discount || 0).toLocaleString()} Rs`, pageWidth - margin - 2, yPos + 4, { align: 'right' })
  yPos += 6
  pdf.line(margin, yPos, pageWidth - margin, yPos)

  // Grand Total - Bold and prominent
  pdf.setFillColor(0, 0, 0)
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  pdf.setDrawColor(255, 255, 255)
  pdf.line(col3End, yPos, col3End, yPos + 8)
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(10)
  pdf.setFont(undefined, 'bold')
  pdf.text('GRAND TOTAL', margin + 100, yPos + 5, { align: 'right' })
  const grandTotal = subtotal + (data.siteCharges || 0) - (data.discount || 0)
  pdf.text(`${grandTotal.toLocaleString()} Rs`, pageWidth - margin - 2, yPos + 5, { align: 'right' })
  pdf.setTextColor(0, 0, 0)
  yPos += 10
  pdf.setDrawColor(200, 200, 200)
  pdf.line(margin, yPos, pageWidth - margin, yPos)

  // Token Money and Installments
  pdf.setFontSize(9)
  pdf.setFont(undefined, 'normal')
  pdf.line(col3End, yPos, col3End, yPos + 6)
  pdf.text('TOKEN MONEY PAID', margin + 100, yPos + 4, { align: 'right' })
  pdf.text(`${(data.tokenMoneyPaid || 0).toLocaleString()}`, pageWidth - margin - 2, yPos + 4, { align: 'right' })
  yPos += 6
  pdf.line(margin, yPos, pageWidth - margin, yPos)
  pdf.line(col3End, yPos, col3End, yPos + 6)
  pdf.text('SECOND INSTALLMENT', margin + 100, yPos + 4, { align: 'right' })
  pdf.text(`${(data.secondInstallment || 0).toLocaleString()}`, pageWidth - margin - 2, yPos + 4, { align: 'right' })
  yPos += 6
  pdf.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 12

  // Bank Details - with proper spacing
  pdf.setFillColor(240, 240, 240)
  const bankBoxHeight = 22
  pdf.rect(margin, yPos, pageWidth - 2 * margin, bankBoxHeight, 'F')
  pdf.setFontSize(10)
  pdf.setFont(undefined, 'bold')
  pdf.text('Company Bank Detail:', margin + 3, yPos + 6)
  pdf.setFont(undefined, 'normal')
  pdf.setFontSize(9)
  pdf.text(`Bank Name: ${data.bankName || 'HDFC BANK'}`, margin + 3, yPos + 10)
  pdf.text(`Account No: ${data.accountNo || ''}`, margin + 3, yPos + 14)
  pdf.text(`Account Name: ${data.accountName || ''}`, margin + 3, yPos + 18)
  yPos += bankBoxHeight + 8

  // Footer
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.5)
  pdf.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 5
  pdf.setFontSize(8)
  pdf.text('Visit our website www.omnicassion.com to get access to our services.', pageWidth / 2, yPos, { align: 'center' })
  yPos += 5
  pdf.setFontSize(12)
  pdf.setFont(undefined, 'bold')
  pdf.text('JUST SIT BACK AND ENJOY', pageWidth / 2, yPos, { align: 'center' })

  // Save PDF
  const fileName = `${invoiceTypeText}-${data.invoiceNumber || 'INV'}.pdf`.replace(/\s+/g, '-')
  pdf.save(fileName)
}
