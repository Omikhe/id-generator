"use client"

import React, { useState, useRef } from 'react';
import { Upload, Download, User, Users, Camera } from 'lucide-react';
import * as Papa from 'papaparse';

const EmployeeIDGenerator = () => {
  const [activeTab, setActiveTab] = useState('single');
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    phone: '',
    email: '',
    location: '',
    blinqId: '',
    photo: null
  });
  const [csvData, setCsvData] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          photo: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          setCsvData(results.data.filter(row => row.some(cell => cell.trim())));
        },
        header: true,
        skipEmptyLines: true
      });
    }
  };

  const generateQRCode = async (text) => {
    // Simple QR code generation using a placeholder pattern
    // In a real implementation, you'd use a proper QR code library
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="white"/>
        <rect x="10" y="10" width="80" height="80" fill="black"/>
        <rect x="20" y="20" width="60" height="60" fill="white"/>
        <rect x="30" y="30" width="40" height="40" fill="black"/>
        <text x="50" y="55" text-anchor="middle" fill="white" font-size="8">QR</text>
      </svg>
    `)}`;
  };

  const generateSingleID = async () => {
    setIsGenerating(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 1125;
    canvas.height = 675;
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    ctx.fillStyle = '#00bcd4';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Valuations Africa', 50, 50);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Employee Identity Card', 250, 50);
    
    // Photo placeholder
    if (formData.photo) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 50, 100, 150, 180);
        continueDrawing();
      };
      img.src = formData.photo;
    } else {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(50, 100, 150, 180);
      ctx.fillStyle = '#666666';
      ctx.font = '16px Arial';
      ctx.fillText('No Photo', 100, 190);
      continueDrawing();
    }
    
    function continueDrawing() {
      // Employee details
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 18px Arial';
      
      const details = [
        ['Name', formData.name],
        ['Position', formData.position],
        ['Phone number', formData.phone],
        ['Email', formData.email],
        ['Base location', formData.location]
      ];
      
      let yPos = 120;
      details.forEach(([label, value]) => {
        ctx.font = 'bold 16px Arial';
        ctx.fillText(label, 250, yPos);
        ctx.font = '16px Arial';
        ctx.fillText(value || 'N/A', 400, yPos);
        yPos += 30;
      });
      
      // QR Code placeholder
      ctx.fillStyle = '#000000';
      ctx.fillRect(650, 350, 100, 100);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.fillText('QR Code', 680, 405);
      
      // Download the image
      const link = document.createElement('a');
      link.download = `${formData.name || 'employee'}_id.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      setIsGenerating(false);
    }
  };

  const generateBulkIDs = async () => {
    if (csvData.length === 0) return;
    
    setIsGenerating(true);
    
    // Create a simple text-based "PDF" content
    let pdfContent = 'EMPLOYEE ID CARDS\n\n';
    
    csvData.forEach((employee, index) => {
      pdfContent += `ID CARD ${index + 1}\n`;
      pdfContent += '='.repeat(50) + '\n';
      pdfContent += `Name: ${employee.Fullname || employee.name || 'N/A'}\n`;
      pdfContent += `Position: ${employee.Position || employee.position || 'N/A'}\n`;
      pdfContent += `Phone: ${employee['Phone Number'] || employee.phone || 'N/A'}\n`;
      pdfContent += `Email: ${employee['Company email address'] || employee.email || 'N/A'}\n`;
      pdfContent += `Location: ${employee['Location (District or City where you operate)'] || employee.location || 'N/A'}\n`;
      pdfContent += `Blinq ID: ${employee['Link to Blinq ID'] || employee.blinqId || 'N/A'}\n`;
      pdfContent += '\n\n';
    });
    
    // Download as text file (in a real app, you'd generate actual PDF)
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = 'employee_ids.txt';
    link.href = URL.createObjectURL(blob);
    link.click();
    
    setIsGenerating(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Employee ID Generator</h1>
        <p className="text-gray-600">Generate professional employee ID cards individually or in bulk</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex items-center px-4 py-2 rounded-md transition-all ${
            activeTab === 'single'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <User className="w-4 h-4 mr-2" />
          Single ID
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`flex items-center px-4 py-2 rounded-md transition-all ${
            activeTab === 'bulk'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          Bulk Upload
        </button>
      </div>

      {activeTab === 'single' && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Generate Single ID Card</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Location
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blinq ID URL
                </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Photo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {formData.photo ? (
                  <div className="space-y-2">
                    <img
                      src={formData.photo}
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
              {isGenerating ? 'Generating...' : 'Generate & Download ID'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'bulk' && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Bulk Generate ID Cards</h2>
          
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Upload CSV file with employee data</p>
              <p className="text-sm text-gray-500 mb-4">
                Required columns: Fullname, Position, Phone Number, Company email address, Location, Link to Blinq ID
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
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
                        <td className="p-2">{employee.Fullname || employee.name || 'N/A'}</td>
                        <td className="p-2">{employee.Position || employee.position || 'N/A'}</td>
                        <td className="p-2">{employee['Phone Number'] || employee.phone || 'N/A'}</td>
                        <td className="p-2">{employee['Company email address'] || employee.email || 'N/A'}</td>
                        <td className="p-2">{employee['Location (District or City where you operate)'] || employee.location || 'N/A'}</td>
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
              {isGenerating ? 'Generating...' : `Generate ${csvData.length} ID Cards (PDF)`}
            </button>
          )}
        </div>
      )}

      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default EmployeeIDGenerator;