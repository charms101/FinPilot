import { NextRequest, NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { transactions = [], budgets = [], currency = 'USD', user = {} } = body

    // Create a new PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      info: {
        Title: 'FinPilot AI Wealth Statement',
        Author: 'FinPilot AI Platform',
        Subject: 'Monthly Personal Finance Analysis',
      },
    })

    const chunks: any[] = []
    doc.on('data', (chunk) => chunks.push(chunk))

    // Helper: format currency
    const formatValue = (num: number) => {
      const symbols: Record<string, string> = { USD: '$', EUR: '€', INR: 'Rs. ', GBP: '£' }
      const sym = symbols[currency] || '$'
      return `${sym}${num.toFixed(2)}`
    }

    // 1. Header Section
    doc
      .fillColor('#0F172A') // Primary Color
      .fontSize(24)
      .text('FinPilot AI', 50, 45)
      .fontSize(10)
      .fillColor('#64748B')
      .text('Smarter Money Management Co-Pilot', 50, 75)
      .text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 50, 90, { align: 'right' })
      .moveDown(1.5)

    // Divider Line
    doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(50, 110).lineTo(545, 110).stroke()

    // User details box
    doc
      .fillColor('#0F172A')
      .fontSize(12)
      .text('Statement For:', 50, 130)
      .fontSize(10)
      .fillColor('#334155')
      .text(`Name: ${user.fullName || 'FinPilot Guest User'}`, 50, 145)
      .text(`Email: ${user.primaryEmail || 'guest@finpilot.ai'}`, 50, 160)

    // Summary calculations
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthTxs = transactions.filter((tx: any) => {
      const d = new Date(tx.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    const totalIncome = monthTxs
      .filter((tx: any) => tx.type === 'INCOME')
      .reduce((sum: number, tx: any) => sum + tx.amount, 0)

    const totalExpenses = monthTxs
      .filter((tx: any) => tx.type === 'EXPENSE')
      .reduce((sum: number, tx: any) => sum + tx.amount, 0)

    const netSavings = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0

    // 2. Metrics Block (Draw rectangle boxes)
    doc.rect(50, 190, 495, 60).fill('#F8FAFC')
    
    doc
      .fillColor('#0F172A')
      .fontSize(9)
      .text('TOTAL INCOME', 70, 205)
      .fontSize(14)
      .text(formatValue(totalIncome), 70, 220)

    doc
      .fillColor('#0F172A')
      .fontSize(9)
      .text('TOTAL EXPENSES', 200, 205)
      .fontSize(14)
      .fillColor('#EF4444')
      .text(formatValue(totalExpenses), 200, 220)

    doc
      .fillColor('#0F172A')
      .fontSize(9)
      .text('NET SAVINGS', 330, 205)
      .fontSize(14)
      .fillColor('#10B981')
      .text(formatValue(netSavings), 330, 220)

    doc
      .fillColor('#0F172A')
      .fontSize(9)
      .text('SAVINGS RATE', 460, 205)
      .fontSize(14)
      .text(`${savingsRate.toFixed(1)}%`, 460, 220)

    // Reset fill colors
    doc.fillColor('#0F172A')

    // 3. Budgets & Categories Summary Table
    doc.fontSize(14).text('Budgets vs Category Outlays', 50, 275)
    
    // Draw Category Table headers
    doc.fontSize(9).fillColor('#64748B')
    doc.text('Category', 50, 300)
    doc.text('Monthly Limit', 180, 300, { align: 'right', width: 80 })
    doc.text('Spent Amount', 290, 300, { align: 'right', width: 80 })
    doc.text('Status', 420, 300, { align: 'right', width: 80 })
    
    doc.strokeColor('#E2E8F0').lineWidth(0.5).moveTo(50, 315).lineTo(545, 315).stroke()

    let yOffset = 325
    budgets.forEach((budget: any) => {
      const spentPercent = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0
      const statusText = spentPercent >= 100 ? 'EXCEEDED' : spentPercent >= 85 ? 'WARNING' : 'HEALTHY'
      const statusColor = spentPercent >= 100 ? '#EF4444' : spentPercent >= 85 ? '#F59E0B' : '#10B981'

      doc.fillColor('#0F172A').fontSize(10).text(budget.category, 50, yOffset)
      doc.text(formatValue(budget.limit), 180, yOffset, { align: 'right', width: 80 })
      doc.text(formatValue(budget.spent), 290, yOffset, { align: 'right', width: 80 })
      
      doc.fillColor(statusColor).text(statusText, 420, yOffset, { align: 'right', width: 80 })

      yOffset += 20
    })

    // 4. Recent Transactions Table (adds a new page if list overflows)
    doc.addPage()

    doc.fillColor('#0F172A').fontSize(14).text('Transactions Ledger (Current Month)', 50, 45)
    
    // Table Headers
    doc.fontSize(9).fillColor('#64748B')
    doc.text('Merchant', 50, 70)
    doc.text('Category', 180, 70)
    doc.text('Date', 280, 70)
    doc.text('Type', 370, 70)
    doc.text('Amount', 460, 70, { align: 'right', width: 80 })

    doc.strokeColor('#E2E8F0').lineWidth(0.5).moveTo(50, 85).lineTo(545, 85).stroke()

    yOffset = 95
    const latestTxs = monthTxs.slice(0, 20) // Limit to 20 transactions for the report view page layout

    latestTxs.forEach((tx: any) => {
      // Check if page overflow
      if (yOffset > 750) {
        doc.addPage()
        doc.fillColor('#0F172A').fontSize(14).text('Transactions Ledger (Cont.)', 50, 45)
        
        // Redraw Headers
        doc.fontSize(9).fillColor('#64748B')
        doc.text('Merchant', 50, 70)
        doc.text('Category', 180, 70)
        doc.text('Date', 280, 70)
        doc.text('Type', 370, 70)
        doc.text('Amount', 460, 70, { align: 'right', width: 80 })
        doc.strokeColor('#E2E8F0').lineWidth(0.5).moveTo(50, 85).lineTo(545, 85).stroke()
        yOffset = 95
      }

      const txDateStr = new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const amountColor = tx.type === 'INCOME' ? '#10B981' : '#0F172A'

      doc.fillColor('#0F172A').fontSize(9).text(tx.merchant, 50, yOffset)
      doc.text(tx.category, 180, yOffset)
      doc.text(txDateStr, 280, yOffset)
      doc.text(tx.type, 370, yOffset)
      
      doc.fillColor(amountColor).text(tx.type === 'INCOME' ? `+${formatValue(tx.amount)}` : `-${formatValue(tx.amount)}`, 460, yOffset, { align: 'right', width: 80 })

      yOffset += 20
    })

    // Footer signature
    doc.fillColor('#64748B').fontSize(8).text('FinPilot AI statement generated automatically. Secure database sync enabled.', 50, 780, { align: 'center' })

    doc.end()

    // Wait for the stream to finish and get the PDF Buffer
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks))
      })
    })

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="FinPilot_AI_Report.pdf"',
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
