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

  // Calculate proper column positions for professional table layout
  const serviceColWidth = 90   // Much more conservative width
  const qtyColWidth = 25       // Width for quantity column
  const priceColWidth = 35     // Width for price column
  
  const serviceColEnd = margin + serviceColWidth
  const qtyColEnd = serviceColEnd + qtyColWidth
  const priceColEnd = qtyColEnd + priceColWidth
  // Total column uses remaining space
  
  // Professional Services Table Header
  pdf.setFillColor(40, 40, 40) // Dark gray background
  const headerHeight = 10
  pdf.rect(margin, yPos, pageWidth - 2 * margin, headerHeight, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(10)
  pdf.setFont(undefined, 'bold')
  
  pdf.text('SERVICE', margin + 3, yPos + 7)
  pdf.text('QTY', serviceColEnd + 10, yPos + 7, { align: 'center' })
  pdf.text('PRICE', qtyColEnd + 15, yPos + 7, { align: 'center' })
  pdf.text('TOTAL', pageWidth - margin - 3, yPos + 7, { align: 'right' })
  
  // Draw vertical separators in header
  pdf.setDrawColor(255, 255, 255)
  pdf.setLineWidth(0.5)
  pdf.line(serviceColEnd, yPos, serviceColEnd, yPos + headerHeight)
  pdf.line(qtyColEnd, yPos, qtyColEnd, yPos + headerHeight)
  pdf.line(priceColEnd, yPos, priceColEnd, yPos + headerHeight)
  
  pdf.setTextColor(0, 0, 0)
  yPos += headerHeight

  // Professional table rows with reliable text wrapping
  pdf.setFontSize(8)
  pdf.setFont(undefined, 'normal')
  pdf.setDrawColor(220, 220, 220) // Light gray borders
  pdf.setLineWidth(0.3)
  
  let isAlternateRow = false
  
  data.items?.forEach((item, index) => {
    if (yPos > pageHeight - 40) {
      pdf.addPage()
      yPos = margin
    }
    
    // Set font properties before text operations
    pdf.setFontSize(8)
    pdf.setFont(undefined, 'normal')
    
    // Calculate text wrapping with very conservative width
    const serviceText = item.service || 'Service description'
    const maxTextWidth = serviceColWidth - 10 // 10px total padding
    
    // Use jsPDF's built-in text splitting with conservative width
    const serviceLines = pdf.splitTextToSize(serviceText, maxTextWidth)
    
    // Calculate row height based on number of lines
    const baseRowHeight = 10
    const lineSpacing = 4
    const rowHeight = Math.max(baseRowHeight, serviceLines.length * lineSpacing + 6)
    const rowTop = yPos
    
    // Alternate row background for better readability
    if (isAlternateRow) {
      pdf.setFillColor(248, 248, 248)
      pdf.rect(margin, rowTop, pageWidth - 2 * margin, rowHeight, 'F')
    }
    
    // Draw row borders
    pdf.setDrawColor(220, 220, 220)
    pdf.line(margin, rowTop, pageWidth - margin, rowTop)
    pdf.line(serviceColEnd, rowTop, serviceColEnd, rowTop + rowHeight)
    pdf.line(qtyColEnd, rowTop, qtyColEnd, rowTop + rowHeight)
    pdf.line(priceColEnd, rowTop, priceColEnd, rowTop + rowHeight)
    
    // Service description with simple, reliable text rendering
    const startX = margin + 3
    const startY = rowTop + 6
    
    // Render each line of wrapped text
    for (let i = 0; i < serviceLines.length; i++) {
      const line = serviceLines[i]
      if (line && line.trim()) {
        const yPos = startY + (i * lineSpacing)
        pdf.setFontSize(8)
        pdf.setFont(undefined, 'normal')
        pdf.text(line.trim(), startX, yPos)
      }
    }
    
    // Quantity centered in its cell
    const qtyY = rowTop + (rowHeight / 2) + 2
    pdf.text(String(item.quantity || 1), serviceColEnd + (qtyColWidth/2), qtyY, { align: 'center' })
    
    // Price centered in its cell
    const priceText = `${(item.price || 0).toLocaleString()} Rs`
    pdf.text(priceText, qtyColEnd + (priceColWidth/2), qtyY, { align: 'center' })
    
    // Total right-aligned in its cell
    const totalText = `${(item.total || 0).toLocaleString()} Rs`
    pdf.text(totalText, pageWidth - margin - 3, qtyY, { align: 'right' })
    
    yPos += rowHeight
    isAlternateRow = !isAlternateRow
  })
  
  // Bottom border of table
  pdf.line(margin, yPos, pageWidth - margin, yPos)

  // Site Charges with improved styling
  const siteRowHeight = 12
  pdf.setFillColor(248, 248, 248)
  pdf.rect(margin, yPos, pageWidth - 2 * margin, siteRowHeight, 'F')
  pdf.setDrawColor(220, 220, 220)
  pdf.line(priceColEnd, yPos, priceColEnd, yPos + siteRowHeight)
  pdf.setFontSize(9)
  pdf.text('Site Charges', margin + 3, yPos + 7)
  const siteChargesText = `${(data.siteCharges || 0).toLocaleString()} Rs`
  pdf.text(siteChargesText, pageWidth - margin - 3, yPos + 7, { align: 'right' })
  yPos += siteRowHeight
  pdf.line(margin, yPos, pageWidth - margin, yPos)

  // Subtotal with professional styling
  pdf.setFillColor(245, 245, 245)
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F')
  pdf.setDrawColor(200, 200, 200)
  pdf.line(priceColEnd, yPos, priceColEnd, yPos + 10)
  pdf.setFont(undefined, 'bold')
  pdf.setFontSize(10)
  // Align subtotal label to the right edge of PRICE column
  pdf.text('SUBTOTAL', priceColEnd - 3, yPos + 7, { align: 'right' })
  const subtotal = (data.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0) + (data.siteCharges || 0)
  pdf.text(`${subtotal.toLocaleString()} Rs`, pageWidth - margin - 3, yPos + 7, { align: 'right' })
  yPos += 10
  pdf.line(margin, yPos, pageWidth - margin, yPos)

  // Discount row
  pdf.setFont(undefined, 'normal')
  pdf.setFontSize(9)
  pdf.line(priceColEnd, yPos, priceColEnd, yPos + 8)
  pdf.text('DISCOUNT', priceColEnd - 3, yPos + 6, { align: 'right' })
  pdf.text(`${(data.discount || 0).toLocaleString()} Rs`, pageWidth - margin - 3, yPos + 6, { align: 'right' })
  yPos += 8
  pdf.line(margin, yPos, pageWidth - margin, yPos)

  // Grand Total with enhanced prominence
  pdf.setFillColor(40, 40, 40)
  const grandTotalHeight = 12
  pdf.rect(margin, yPos, pageWidth - 2 * margin, grandTotalHeight, 'F')
  pdf.setDrawColor(255, 255, 255)
  pdf.line(priceColEnd, yPos, priceColEnd, yPos + grandTotalHeight)
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(11)
  pdf.setFont(undefined, 'bold')
  pdf.text('GRAND TOTAL', priceColEnd - 3, yPos + 8, { align: 'right' })
  const grandTotal = subtotal - (data.discount || 0)
  pdf.text(`${grandTotal.toLocaleString()} Rs`, pageWidth - margin - 3, yPos + 8, { align: 'right' })
  pdf.setTextColor(0, 0, 0)
  yPos += grandTotalHeight

  // Payment tracking rows with better styling
  pdf.setFont(undefined, 'normal')
  pdf.setFontSize(9)
  pdf.setDrawColor(220, 220, 220)
  
  // Token Money row
  const paymentRowHeight = 10
  pdf.line(margin, yPos, pageWidth - margin, yPos)
  pdf.line(priceColEnd, yPos, priceColEnd, yPos + paymentRowHeight)
  pdf.text('TOKEN MONEY PAID', priceColEnd - 3, yPos + 6, { align: 'right' })
  pdf.text(`${(data.tokenMoneyPaid || 0).toLocaleString()}`, pageWidth - margin - 3, yPos + 6, { align: 'right' })
  yPos += paymentRowHeight
  
  // Second Installment row
  pdf.line(margin, yPos, pageWidth - margin, yPos)
  pdf.line(priceColEnd, yPos, priceColEnd, yPos + paymentRowHeight)
  pdf.text('SECOND INSTALLMENT', priceColEnd - 3, yPos + 6, { align: 'right' })
  pdf.text(`${(data.secondInstallment || 0).toLocaleString()}`, pageWidth - margin - 3, yPos + 6, { align: 'right' })
  yPos += paymentRowHeight
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
