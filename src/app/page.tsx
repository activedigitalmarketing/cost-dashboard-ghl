'use client'

import { useState } from 'react'
import FileUpload from './components/FileUpload'
import CostAnalysisDashboard from './components/CostAnalysisDashboard'

export default function Home() {
  const [data, setData] = useState<any[]>([])
  const [fileName, setFileName] = useState('')

  const handleDataLoaded = (parsedData: any[], filename: string) => {
    setData(parsedData)
    setFileName(filename)
  }

  const handleReset = () => {
    setData([])
    setFileName('')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Cost Dashboard GHL
              </h1>
              <p className="text-gray-600">
                Upload your cost spreadsheet to visualize and analyze your data
              </p>
            </div>
            {data.length > 0 && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                Upload New File
              </button>
            )}
          </div>
          
          {data.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="font-medium">File: {fileName}</span>
                <span>{data.length.toLocaleString()} records loaded</span>
              </div>
            </div>
          )}
        </div>

        {data.length === 0 ? (
          <FileUpload onDataLoaded={handleDataLoaded} />
        ) : (
          <CostAnalysisDashboard data={data} />
        )}
      </div>
    </main>
  )
}