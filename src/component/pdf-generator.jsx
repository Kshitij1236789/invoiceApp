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

  // Header with professional logo handling
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.3)
  
  // Company logo and name (left side)
  const logoX = margin
  const logoY = yPos
  
  // Try to add the actual logo image if available
  let logoAdded = false
  if (data.logo) {
    try {
      // Add logo image directly if it's a valid base64 data URL
      if (data.logo.startsWith('data:image/')) {
        console.log('Adding logo to PDF...')
        pdf.addImage(data.logo, 'PNG', logoX, logoY, 40, 12)
        logoAdded = true
        console.log('Logo added successfully to PDF')
      }
    } catch (e) {
      console.log('Logo image failed to load, using text logo instead:', e)
    }
  }
  
  // If logo wasn't added successfully, show text-based logo
  if (!logoAdded) {
    // OMNICASSION brand text with professional styling
    pdf.setFontSize(24)
    pdf.setFont(undefined, 'bold')
    pdf.setTextColor(37, 99, 235) // Blue color
    pdf.text('OMNIC', logoX, logoY + 12)
    
    // Triangle/A symbol - using simple line drawing for better compatibility
    pdf.setFillColor(0, 0, 0) // Black triangle
    pdf.setDrawColor(0, 0, 0)
    pdf.setLineWidth(1.5)
    const triangleX = logoX + 42
    const triangleY = logoY + 2
    
    // Draw triangle using three lines and fill
    pdf.line(triangleX, triangleY + 12, triangleX + 6, triangleY) // Left side
    pdf.line(triangleX + 6, triangleY, triangleX + 12, triangleY + 12) // Right side  
    pdf.line(triangleX + 12, triangleY + 12, triangleX, triangleY + 12) // Base
    
    // Fill the triangle area with smaller triangles for solid fill
    for (let i = 0; i < 12; i++) {
      const y = triangleY + i
      const width = (12 - i) * 0.5
      if (width > 0) {
        pdf.line(triangleX + 6 - width, y, triangleX + 6 + width, y)
      }
    }
    
    pdf.setTextColor(37, 99, 235) // Blue color
    pdf.text('SSION', triangleX + 16, logoY + 12)
    
    // Event Management Platform subtitle
    pdf.setFontSize(9)
    pdf.setFont(undefined, 'normal')
    pdf.setTextColor(100, 100, 100)
    pdf.text('Event Management Platform', logoX, logoY + 18)
    pdf.text('All types of vendors and services related to your event are provided here', logoX, logoY + 22)
  }
  
  // QR Code on the right with improved handling
  const qrSize = 18
  const qrX = pageWidth - margin - qrSize
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.8)
  pdf.rect(qrX - 2, yPos - 2, qrSize + 4, qrSize + 4)
  
  let qrAdded = false
  if (data.qrCode && data.qrCode.startsWith('data:image/')) {
    try {
      // Add QR code image if available and valid
      console.log('Adding QR code to PDF...')
      pdf.addImage(data.qrCode, 'PNG', qrX, yPos, qrSize, qrSize)
      qrAdded = true
      console.log('QR code added successfully to PDF')
    } catch (e) {
      console.log('QR code failed to load:', e)
    }
  } else {
    console.log('QR code data not available or invalid format:', data.qrCode ? 'Invalid format' : 'No QR data')
  }
  
  if (!qrAdded) {
    // Generate a simple QR-like pattern as placeholder
    pdf.setFillColor(0, 0, 0)
    const cellSize = qrSize / 9
    const qrPattern = [
      [1,1,1,0,1,0,1,1,1],
      [1,0,1,0,1,0,1,0,1],
      [1,1,1,0,1,0,1,1,1],
      [0,0,0,0,0,0,0,0,0],
      [1,0,1,1,0,1,1,0,1],
      [0,1,0,1,1,0,0,1,0],
      [1,1,1,0,0,1,1,0,1],
      [1,0,1,1,0,0,1,0,1],
      [1,1,1,0,1,1,0,1,1]
    ]
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (qrPattern[row][col]) {
          pdf.rect(qrX + col * cellSize, yPos + row * cellSize, cellSize, cellSize, 'F')
        }
      }
    }
  }
  
  pdf.setTextColor(0, 0, 0) // Reset to black
  
  yPos += 30

  // Horizontal separator line
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.8)
  pdf.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 8

  // QUOTATION title and invoice number
  pdf.setFontSize(24)
  pdf.setFont(undefined, 'bold')
  pdf.setTextColor(0, 0, 0)
  const invoiceTypeText = data.invoiceType || 'QUOTATION'
  pdf.text(invoiceTypeText, margin, yPos)
  
  // Invoice Number in professional box on right
  pdf.setFontSize(11)
  pdf.setFont(undefined, 'normal')
  const invoiceNumText = data.invoiceNumber || 'OMNI/26-01/867'
  const numWidth = pdf.getTextWidth(invoiceNumText)
  const boxPadding = 6
  const boxWidth = Math.max(numWidth + (boxPadding * 2), 35)
  const boxHeight = 8
  const boxX = pageWidth - margin - boxWidth
  const boxY = yPos - 6
  
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(1)
  pdf.rect(boxX, boxY, boxWidth, boxHeight)
  pdf.text(invoiceNumText, boxX + boxWidth/2, boxY + boxHeight/2 + 1, { align: 'center' })
  
  yPos += 15

  // Professional three-column information layout
  pdf.setFontSize(10)
  pdf.setTextColor(0, 0, 0)
  const col1X = margin
  const col2X = margin + 65
  const col3X = pageWidth - margin - 55
  
  // Left Column - Date Issued
  pdf.setFont(undefined, 'bold')
  pdf.text('Date Issued:', col1X, yPos)
  pdf.setFont(undefined, 'normal')
  pdf.setFontSize(9)
  const dateText = data.dateIssued || new Date().toLocaleDateString('en-GB')
  pdf.text(dateText, col1X, yPos + 6)
  
  // Middle Column - Vendor name
  pdf.setFontSize(10)
  pdf.setFont(undefined, 'bold')
  pdf.text('Vendor name:', col2X, yPos)
  pdf.setFont(undefined, 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(37, 99, 235) // Blue color for vendor name
  pdf.text('omnicassion', col2X, yPos + 6)
  
  // Right Column - Contact Info (properly aligned)
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(10)
  pdf.setFont(undefined, 'bold')
  pdf.text('Contact Info:', col3X, yPos)
  pdf.setFont(undefined, 'normal')
  pdf.setFontSize(8)
  const email = data.contactEmail || 'omnicassion@gmail.com'
  const phone1 = data.contactPhone1 || '+91-6284598500'
  const phone2 = data.contactPhone2 || '+91 9988777462'
  const website = data.website || 'omnicassion.com'
  
  pdf.text(email, col3X, yPos + 4)
  pdf.text(`${phone1}, ${phone2}`, col3X, yPos + 8)
  pdf.text(website, col3X, yPos + 12)
  
  yPos += 18

  // Issued To section with better styling
  pdf.setFontSize(10)
  pdf.setFont(undefined, 'bold')
  pdf.setTextColor(0, 0, 0)
  pdf.text('Issued to:', col1X, yPos)
  pdf.setFont(undefined, 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(37, 99, 235) // Blue color for recipient name
  const issuedToText = data.issuedTo || 'kshitij'
  pdf.text(issuedToText, col1X, yPos + 6)
  pdf.setTextColor(0, 0, 0) // Reset color
  yPos += 15

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
