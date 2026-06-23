'use client'

import React, { useState } from 'react'
import { createWorker } from 'tesseract.js'
import { motion } from 'framer-motion'
import { Scan, Upload, RefreshCw, Check, Sparkles, HelpCircle, Save } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function ReceiptScanner() {
  const hasHydrated = useHasHydrated()
  const router = useRouter()
  
  // Zustand State
  const addTransaction = useFinanceStore((state) => state.addTransaction)
  const currency = useFinanceStore((state) => state.currency)

  // Local State
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrText, setOcrText] = useState('')
  const [extractedData, setExtractedData] = useState<{
    merchant: string
    amount: number
    date: string
    category: string
    description: string
  } | null>(null)

  if (!hasHydrated) {
    return (
      <div className="flex flex-col gap-6 animate-pulse text-left">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    )
  }

  // Handle image select
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      // Reset previous extract
      setExtractedData(null)
      setOcrText('')
    }
  }

  // Heuristic parser to extract merchant, amount, date
  const parseReceiptText = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    let merchant = 'Unknown Merchant'
    let amount = 0.00
    let date = new Date().toISOString().split('T')[0]
    let category = 'Other'
    let description = 'OCR Scanned Receipt'

    // 1. Extract Merchant (Check lines against common patterns)
    const merchantsMap: Record<string, string> = {
      starbucks: 'Starbucks',
      'whole foods': 'Whole Foods',
      target: 'Target',
      walmart: 'Walmart',
      uber: 'Uber',
      lyft: 'Lyft',
      netflix: 'Netflix',
      spotify: 'Spotify',
      apple: 'Apple Store',
      amc: 'AMC Theatres',
      cvs: 'CVS Pharmacy',
      comcast: 'Comcast Xfinity',
      coned: 'ConEd',
      verizon: 'Verizon Wireless',
    }

    const categoriesMap: Record<string, string> = {
      Starbucks: 'Food',
      'Whole Foods': 'Food',
      Target: 'Shopping',
      Walmart: 'Shopping',
      Uber: 'Transportation',
      Lyft: 'Transportation',
      Netflix: 'Entertainment',
      Spotify: 'Entertainment',
      'Apple Store': 'Shopping',
      'AMC Theatres': 'Entertainment',
      'CVS Pharmacy': 'Healthcare',
      'Comcast Xfinity': 'Bills',
      ConEd: 'Bills',
      'Verizon Wireless': 'Bills',
    }

    // Try finding merchant name in lines
    let foundMerchant = false
    for (const line of lines) {
      const lowerLine = line.toLowerCase()
      for (const [key, val] of Object.entries(merchantsMap)) {
        if (lowerLine.includes(key)) {
          merchant = val
          category = categoriesMap[val] || 'Other'
          foundMerchant = true
          break
        }
      }
      if (foundMerchant) break
    }

    // Fallback: use first clean line as merchant name
    if (!foundMerchant && lines.length > 0) {
      // Find first line that doesn't look like code or date or amount
      const cleanLine = lines.find(l => !l.match(/\d/) && l.length > 2 && l.length < 30)
      if (cleanLine) {
        merchant = cleanLine
      }
    }

    // 2. Extract Amount (Look for largest float match, as Total is typically the largest number)
    const amountRegex = /(?:\$|usd)?\s*(\d+\.\d{2})/gi
    let matches: number[] = []
    let match
    
    // Find all amounts
    while ((match = amountRegex.exec(text)) !== null) {
      const val = parseFloat(match[1])
      if (!isNaN(val) && val < 5000) { // filter out extreme outlier codes
        matches.push(val)
      }
    }

    if (matches.length > 0) {
      // Return the largest number on the receipt (usually total)
      amount = Math.max(...matches)
    }

    // 3. Extract Date
    const dateRegexes = [
      /(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/, // MM/DD/YYYY or DD/MM/YYYY
      /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/, // YYYY-MM-DD
    ]

    for (const regex of dateRegexes) {
      const dMatch = regex.exec(text)
      if (dMatch) {
        try {
          // Attempt parsing
          const parsedDate = new Date(dMatch[0])
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate.toISOString().split('T')[0]
            break
          }
        } catch (e) {
          console.error(e)
        }
      }
    }

    setExtractedData({
      merchant,
      amount,
      date,
      category,
      description,
    })
  }

  // Run OCR
  const handleProcessReceipt = async () => {
    if (!image) return
    setIsProcessing(true)
    const toastId = toast.loading('Initializing local OCR engine...')

    try {
      const worker = await createWorker('eng')
      toast.loading('Analyzing receipt layout...', { id: toastId })
      
      const { data: { text } } = await worker.recognize(image)
      setOcrText(text)
      await worker.terminate()

      toast.loading('Parsing transaction data...', { id: toastId })
      parseReceiptText(text)
      
      toast.success('Receipt processed successfully!', { id: toastId })
    } catch (err: any) {
      console.error(err)
      toast.error('OCR processing failed: ' + err.message, { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  // Save parsed receipt transaction
  const handleSaveTransaction = () => {
    if (!extractedData) return

    addTransaction({
      merchant: extractedData.merchant,
      amount: extractedData.amount,
      date: new Date(extractedData.date).toISOString(),
      category: extractedData.category,
      type: 'EXPENSE',
      description: extractedData.description,
    })

    toast.success('OCR transaction saved to budgets!')
    router.push('/transactions')
  }

  const handleFieldChange = (field: string, value: any) => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        [field]: value,
      })
    }
  }

  const CATEGORIES = ['Food', 'Shopping', 'Transportation', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other']

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="text-left flex items-center gap-2">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl text-white">
          <Scan className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Receipt Scanner</h1>
          <p className="text-muted-foreground text-sm font-light mt-0.5">Extract billing amounts dynamically using client-side OCR.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Upload box */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="glass-card p-6 rounded-2xl border border-border/80 text-left shadow-xs">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Select Receipt</h2>

            <div className="flex flex-col gap-6">
              {imagePreview ? (
                <div className="relative aspect-[3/4] max-h-[350px] mx-auto rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center">
                  <img src={imagePreview} alt="Receipt Preview" className="object-contain w-full h-full" />
                  <button
                    onClick={() => {
                      setImage(null)
                      setImagePreview(null)
                      setExtractedData(null)
                    }}
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white p-1.5 rounded-lg text-xs font-semibold backdrop-blur-xs transition-colors"
                  >
                    Clear Image
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-border/80 hover:border-secondary/30 rounded-2xl p-12 flex flex-col items-center justify-center gap-3 cursor-pointer bg-muted/10 hover:bg-muted/20 transition-all select-none">
                  <Upload className="w-8 h-8 text-secondary" />
                  <span className="text-xs font-bold text-foreground">Choose receipt file or drag here</span>
                  <span className="text-[10px] text-muted-foreground font-light">Supports JPEG, PNG up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}

              {image && !extractedData && (
                <button
                  onClick={handleProcessReceipt}
                  disabled={isProcessing}
                  className="bg-secondary hover:bg-secondary-hover disabled:opacity-55 text-secondary-foreground font-semibold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-secondary/15 w-full"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processing Image...
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4" /> Run OCR Analysis
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Data Preview & Edit Form */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="glass-card p-6 rounded-2xl border border-border/80 text-left shadow-xs">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Extracted Fields</h2>

            {extractedData ? (
              <div className="flex flex-col gap-4">
                {/* Form fields */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ocr-merchant" className="text-xs font-semibold text-muted-foreground">Merchant / Source</label>
                  <input
                    type="text"
                    id="ocr-merchant"
                    value={extractedData.merchant}
                    onChange={(e) => handleFieldChange('merchant', e.target.value)}
                    className="bg-muted border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="ocr-amount" className="text-xs font-semibold text-muted-foreground">Total Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      id="ocr-amount"
                      value={extractedData.amount}
                      onChange={(e) => handleFieldChange('amount', parseFloat(e.target.value) || 0)}
                      className="bg-muted border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-secondary transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="ocr-date" className="text-xs font-semibold text-muted-foreground">Receipt Date</label>
                    <input
                      type="date"
                      id="ocr-date"
                      value={extractedData.date}
                      onChange={(e) => handleFieldChange('date', e.target.value)}
                      className="bg-muted border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ocr-category" className="text-xs font-semibold text-muted-foreground">Category Map</label>
                  <select
                    id="ocr-category"
                    value={extractedData.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    className="bg-muted border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-secondary transition-colors"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ocr-desc" className="text-xs font-semibold text-muted-foreground">Description</label>
                  <input
                    type="text"
                    id="ocr-desc"
                    value={extractedData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="bg-muted border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <button
                  onClick={handleSaveTransaction}
                  className="bg-success hover:bg-success/90 text-success-foreground font-semibold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-success/15 w-full mt-4"
                >
                  <Save className="w-4 h-4" /> Save parsed receipt
                </button>
              </div>
            ) : (
              <div className="py-24 text-center text-muted-foreground flex flex-col items-center justify-center gap-3 bg-muted/10 border border-border/60 border-dashed rounded-xl">
                <HelpCircle className="w-8 h-8 opacity-30 animate-pulse" />
                <span className="text-xs font-semibold text-foreground/80">Pending Scan</span>
                <p className="text-[11px] text-muted-foreground max-w-xs font-light">Upload a receipt and click &quot;Run OCR Analysis&quot; to inspect parsed items.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
