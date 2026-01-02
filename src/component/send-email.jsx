export async function sendInvoiceEmail(data) {
  try {
    console.log("Sending email to:", data.clientEmail)
    console.log("Invoice:", data.invoiceNumber, data.total)

    // Simulate email delay
    await new Promise((res) => setTimeout(res, 1500))

    return {
      success: true,
      message: "Email sent successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: "Email failed",
    }
  }
}
