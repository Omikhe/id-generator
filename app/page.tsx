"use client"

import { useState, useRef } from "react"
import { Upload, Download, User, Users, Camera } from "lucide-react"
import * as Papa from "papaparse"

const EmployeeIDGenerator = () => {
  const [activeTab, setActiveTab] = useState("single")
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    phone: "",
    email: "",
    location: "",
    blinqId: "",
    photo: null,
  })
  const [csvData, setCsvData] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const fileInputRef = useRef(null)
  const photoInputRef = useRef(null)
  const canvasRef = useRef(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          photo: e.target.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCSVUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          setCsvData(results.data.filter((row) => row.some((cell) => cell.trim())))
        },
        header: true,
        skipEmptyLines: true,
      })
    }
  }

  const generateQRCode = (text) => {
    // Generate a more realistic QR code pattern
    const size = 120
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")

    // White background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, size, size)

    // Black border
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, size, 8)
    ctx.fillRect(0, 0, 8, size)
    ctx.fillRect(size - 8, 0, 8, size)
    ctx.fillRect(0, size - 8, size, 8)

    // Generate random QR pattern
    ctx.fillStyle = "#000000"
    for (let i = 8; i < size - 8; i += 4) {
      for (let j = 8; j < size - 8; j += 4) {
        if (Math.random() > 0.5) {
          ctx.fillRect(i, j, 4, 4)
        }
      }
    }

    // Corner squares
    const cornerSize = 24
    // Top-left
    ctx.fillRect(8, 8, cornerSize, cornerSize)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(12, 12, cornerSize - 8, cornerSize - 8)
    ctx.fillStyle = "#000000"
    ctx.fillRect(16, 16, cornerSize - 16, cornerSize - 16)

    // Top-right
    ctx.fillStyle = "#000000"
    ctx.fillRect(size - 8 - cornerSize, 8, cornerSize, cornerSize)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(size - 12 - cornerSize + 8, 12, cornerSize - 8, cornerSize - 8)
    ctx.fillStyle = "#000000"
    ctx.fillRect(size - 16 - cornerSize + 16, 16, cornerSize - 16, cornerSize - 16)

    // Bottom-left
    ctx.fillStyle = "#000000"
    ctx.fillRect(8, size - 8 - cornerSize, cornerSize, cornerSize)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(12, size - 12 - cornerSize + 8, cornerSize - 8, cornerSize - 8)
    ctx.fillStyle = "#000000"
    ctx.fillRect(16, size - 16 - cornerSize + 16, cornerSize - 16, cornerSize - 16)

    return canvas.toDataURL()
  }

  const generateSingleID = async () => {
    setIsGenerating(true)

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Set canvas size to match the sample (landscape orientation)
    canvas.width = 1050
    canvas.height = 650

    // White background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Load and draw the Valuations Africa logo
    const logoImg = new Image()
    logoImg.crossOrigin = "anonymous"
    logoImg.onload = () => {
      // Draw logo (top-left) - scaled appropriately
      ctx.drawImage(logoImg, 60, 40, 120, 80)

      // Company name and title
      ctx.fillStyle = "#000000"
      ctx.font = "bold 36px Arial, sans-serif"
      ctx.fillText("Employee Identity Card", 320, 90)

      // Draw employee photo or placeholder
      if (formData.photo) {
        const photoImg = new Image()
        photoImg.crossOrigin = "anonymous"
        photoImg.onload = () => {
          // Draw photo with rounded corners effect
          ctx.save()
          ctx.beginPath()
          ctx.roundRect(60, 160, 200, 250, 15)
          ctx.clip()
          ctx.drawImage(photoImg, 60, 160, 200, 250)
          ctx.restore()

          // Add border around photo
          ctx.strokeStyle = "#e0e0e0"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.roundRect(60, 160, 200, 250, 15)
          ctx.stroke()

          continueDrawing()
        }
        photoImg.src = formData.photo
      } else {
        // Draw photo placeholder
        ctx.fillStyle = "#f5f5f5"
        ctx.beginPath()
        ctx.roundRect(60, 160, 200, 250, 15)
        ctx.fill()

        ctx.strokeStyle = "#e0e0e0"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(60, 160, 200, 250, 15)
        ctx.stroke()

        ctx.fillStyle = "#999999"
        ctx.font = "16px Arial, sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("No Photo", 160, 290)
        ctx.textAlign = "left"

        continueDrawing()
      }
    }
    logoImg.src = "/valuations-africa-logo.png"

    function continueDrawing() {
      // Employee details section
      const startX = 320
      const startY = 180
      const lineHeight = 45

      const details = [
        ["Name", formData.name || "N/A"],
        ["Position", formData.position || "N/A"],
        ["Phone number", formData.phone || "N/A"],
        ["Email", formData.email || "N/A"],
        ["Base location", formData.location || "N/A"],
      ]

      details.forEach(([label, value], index) => {
        const yPos = startY + index * lineHeight

        // Label
        ctx.fillStyle = "#000000"
        ctx.font = "bold 20px Arial, sans-serif"
        ctx.fillText(label, startX, yPos)

        // Value
        ctx.fillStyle = "#333333"
        ctx.font = "18px Arial, sans-serif"
        ctx.fillText(value, startX + 180, yPos)
      })

      // Generate and draw QR code
      const qrCodeDataUrl = generateQRCode(formData.blinqId || formData.email || "employee-id")
      const qrImg = new Image()
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 850, 450, 120, 120)

        // Download the generated ID
        const link = document.createElement("a")
        link.download = `${(formData.name || "employee").replace(/\s+/g, "_")}_id.png`
        link.href = canvas.toDataURL("image/png", 1.0)
        link.click()

        setIsGenerating(false)
      }
      qrImg.src = qrCodeDataUrl
    }
  }

  const generateBulkIDs = async () => {
    if (csvData.length === 0) return

    setIsGenerating(true)

    try {
      // Import jsPDF dynamically
      const { jsPDF } = await import("jspdf")
      const pdf = new jsPDF("landscape", "mm", "a4")

      for (let i = 0; i < csvData.length; i++) {
        const employee = csvData[i]

        if (i > 0) {
          pdf.addPage()
        }

        // Add white background
        pdf.setFillColor(255, 255, 255)
        pdf.rect(0, 0, 297, 210, "F")

        // Add company name and title
        pdf.setFontSize(24)
        pdf.setFont("helvetica", "bold")
        pdf.text("Valuations Africa", 20, 25)

        pdf.setFontSize(20)
        pdf.text("Employee Identity Card", 80, 25)

        // Add employee details
        const details = [
          ["Name", employee.Fullname || employee.name || "N/A"],
          ["Position", employee.Position || employee.position || "N/A"],
          ["Phone number", employee["Phone Number"] || employee.phone || "N/A"],
          ["Email", employee["Company email address"] || employee.email || "N/A"],
          ["Base location", employee["Location (District or City where you operate)"] || employee.location || "N/A"],
        ]

        let yPos = 60
        details.forEach(([label, value]) => {
          pdf.setFontSize(12)
          pdf.setFont("helvetica", "bold")
          pdf.text(label, 80, yPos)

          pdf.setFont("helvetica", "normal")
          pdf.text(value, 150, yPos)

          yPos += 15
        })

        // Add photo placeholder
        pdf.setDrawColor(200, 200, 200)
        pdf.setLineWidth(0.5)
        pdf.rect(20, 40, 50, 65)
        pdf.setFontSize(10)
        pdf.text("Photo", 42, 75)

        // Add QR code placeholder
        pdf.rect(220, 120, 30, 30)
        pdf.setFontSize(8)
        pdf.text("QR Code", 230, 140)
      }

      // Download the PDF
      pdf.save("employee_ids_bulk.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
      // Fallback to text file if PDF generation fails
      let textContent = "EMPLOYEE ID CARDS\n\n"

      csvData.forEach((employee, index) => {
        textContent += `ID CARD ${index + 1}\n`
        textContent += "=".repeat(50) + "\n"
        textContent += `Name: ${employee.Fullname || employee.name || "N/A"}\n`
        textContent += `Position: ${employee.Position || employee.position || "N/A"}\n`
        textContent += `Phone: ${employee["Phone Number"] || employee.phone || "N/A"}\n`
        textContent += `Email: ${employee["Company email address"] || employee.email || "N/A"}\n`
        textContent += `Location: ${employee["Location (District or City where you operate)"] || employee.location || "N/A"}\n`
        textContent += `Blinq ID: ${employee["Link to Blinq ID"] || employee.blinqId || "N/A"}\n`
        textContent += "\n\n"
      })

      const blob = new Blob([textContent], { type: "text/plain" })
      const link = document.createElement("a")
      link.download = "employee_ids.txt"
      link.href = URL.createObjectURL(blob)
      link.click()
    }

    setIsGenerating(false)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Employee ID Generator</h1>
        <p className="text-gray-600">Generate professional employee ID cards individually or in bulk</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("single")}
          className={`flex items-center px-4 py-2 rounded-md transition-all ${
            activeTab === "single" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <User className="w-4 h-4 mr-2" />
          Single ID
        </button>
        <button
          onClick={() => setActiveTab("bulk")}
          className={`flex items-center px-4 py-2 rounded-md transition-all ${
            activeTab === "bulk" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          Bulk Upload
        </button>
      </div>

      {activeTab === "single" && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Generate Single ID Card</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter employee's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Property Scout"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+265996892495"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="employee@valuationsafrica.mw"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Lilongwe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blinq ID URL</label>
                <input
                  type="url"
                  name="blinqId"
                  value={formData.blinqId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://blinq.me/..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Photo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {formData.photo ? (
                  <div className="space-y-2">
                    <img
                      src={formData.photo || "/placeholder.svg"}
                      alt="Employee"
                      className="w-32 h-40 object-cover mx-auto rounded"
                    />
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-gray-500">Upload employee photo</p>
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Choose Photo
                    </button>
                  </div>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={generateSingleID}
              disabled={isGenerating || !formData.name || !formData.position}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate & Download ID"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "bulk" && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Bulk Generate ID Cards</h2>

          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Upload CSV file with employee data</p>
              <p className="text-sm text-gray-500 mb-4">
                Required columns: Fullname, Position, Phone Number, Company email address, Location, Link to Blinq ID
              </p>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Choose CSV File
              </button>
            </div>
          </div>

          {csvData.length > 0 && (
            <div className="bg-white rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">Preview ({csvData.length} employees)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Position</th>
                      <th className="text-left p-2">Phone</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 5).map((employee, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{employee.Fullname || employee.name || "N/A"}</td>
                        <td className="p-2">{employee.Position || employee.position || "N/A"}</td>
                        <td className="p-2">{employee["Phone Number"] || employee.phone || "N/A"}</td>
                        <td className="p-2">{employee["Company email address"] || employee.email || "N/A"}</td>
                        <td className="p-2">
                          {employee["Location (District or City where you operate)"] || employee.location || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvData.length > 5 && (
                  <p className="text-gray-500 text-center p-2">... and {csvData.length - 5} more</p>
                )}
              </div>
            </div>
          )}

          {csvData.length > 0 && (
            <button
              onClick={generateBulkIDs}
              disabled={isGenerating}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : `Generate ${csvData.length} ID Cards (PDF)`}
            </button>
          )}
        </div>
      )}

      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  )
}

export default EmployeeIDGenerator
