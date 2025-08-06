// src/app/components/FileUpload.tsx
'use client'

import { useRef, useState, useCallback } from 'react'
import Papa from 'papaparse'

interface FileUploadProps {
  onDataLoaded: (data: any[], filename: string) => void
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processFile = useCallback((file: File) => {
    if (!file) return

    const validTypes = ['.csv']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!validTypes.includes(fileExtension)) {
      setError('Please upload a CSV file (.csv)')
      return
    }

    setIsLoading(true)
    setError(null)

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const cleanData = results.data.map((row: any) => {
            const cleanRow: any = {}
            for (let key in row) {
              const cleanKey = key.trim()
              cleanRow[cleanKey] = row[key]
            }
            return cleanRow
          }).filter((row: any) => row.id && row.amount !== undefined)

          if (cleanData.length === 0) {
            setError('No valid data found in the file. Please check your CSV format.')
            setIsLoading(false)
            return
          }

          onDataLoaded(cleanData, file.name)
          setIsLoading(false)
        } catch (err) {
          setError('Error processing CSV file. Please check the file format.')
          setIsLoading(false)
        }
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`)
        setIsLoading(false)
      }
    })
  }, [onDataLoaded])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Upload Your Cost Data</h2>
        <p className="mt-2 text-gray-600">
          Drag and drop your CSV file or click to browse
        </p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Processing your file...</p>
          </div>
        ) : (
          <div>
            <p className="text-xl text-gray-600 mb-2">
              Drop your file here, or <span className="text-indigo-600 font-medium">browse</span>
            </p>
            <p className="text-sm text-gray-500">Supports CSV files (up to 50MB)</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-medium">Error: {error}</p>
        </div>
      )}

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Expected File Format</h3>
        <p className="text-sm text-gray-600 mb-3">
          Your CSV should contain columns like:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="bg-white p-2 rounded border text-center">
            <code className="text-indigo-600 font-mono">id</code>
          </div>
          <div className="bg-white p-2 rounded border text-center">
            <code className="text-indigo-600 font-mono">type</code>
          </div>
          <div className="bg-white p-2 rounded border text-center">
            <code className="text-indigo-600 font-mono">amount</code>
          </div>
          <div className="bg-white p-2 rounded border text-center">
            <code className="text-indigo-600 font-mono">date</code>
          </div>
          <div className="bg-white p-2 rounded border text-center">
            <code className="text-indigo-600 font-mono">description</code>
          </div>
          <div className="bg-white p-2 rounded border text-center">
            <code className="text-indigo-600 font-mono">locationName</code>
          </div>
          <div className="bg-white p-2 rounded border text-center">
            <code className="text-indigo-600 font-mono">balance</code>
          </div>
          <div className="bg-white p-2 rounded border text-center">
            <code className="text-gray-400 font-mono">...others</code>
          </div>
        </div>
      </div>
    </div>
  )
}