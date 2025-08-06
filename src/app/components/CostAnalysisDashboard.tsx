// src/app/components/CostAnalysisDashboard.tsx
'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

interface CostAnalysisDashboardProps {
  data: any[]
}

export default function CostAnalysisDashboard({ data }: CostAnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Process data for visualizations
  const processedData = useMemo(() => {
    console.log('Processing data, total rows:', data.length)
    
    // Parse dates and clean data
    const dataWithDates = data.map(row => {
      let parsedDate
      try {
        const dateStr = row.date ? row.date.replace(/(\d+)(st|nd|rd|th)/, '$1') : ''
        parsedDate = dateStr ? new Date(dateStr) : null
      } catch (e) {
        parsedDate = null
      }
      
      return {
        ...row,
        parsedDate,
        dateOnly: parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toISOString().split('T')[0] : null,
        amount: parseFloat(row.amount) || 0
      }
    }).filter(row => {
      return (row.parsedDate && !isNaN(row.parsedDate.getTime())) || 
             (row.amount && !isNaN(row.amount))
    })

    console.log('Data with valid dates/amounts:', dataWithDates.length)

    // Group by service type
    const typeGroups = {}
    dataWithDates.forEach(row => {
      const serviceType = row.type || 'Unknown'
      if (!typeGroups[serviceType]) {
        typeGroups[serviceType] = { totalCost: 0, count: 0 }
      }
      typeGroups[serviceType].totalCost += row.amount || 0
      typeGroups[serviceType].count += 1
    })

    const costsByType = Object.keys(typeGroups)
      .map(type => ({
        type: type.length > 25 ? type.substring(0, 25) + '...' : type,
        fullType: type,
        totalCost: Math.round(typeGroups[type].totalCost * 100) / 100,
        count: typeGroups[type].count
      }))
      .sort((a, b) => b.totalCost - a.totalCost)

    // Group by date
    const dateGroups = {}
    dataWithDates.forEach(row => {
      if (!row.dateOnly) return
      if (!dateGroups[row.dateOnly]) {
        dateGroups[row.dateOnly] = { totalCost: 0, count: 0 }
      }
      dateGroups[row.dateOnly].totalCost += row.amount || 0
      dateGroups[row.dateOnly].count += 1
    })

    const dailyCosts = Object.keys(dateGroups)
      .map(date => ({
        date: new Date(date).toLocaleDateString(),
        fullDate: date,
        totalCost: Math.round(dateGroups[date].totalCost * 100) / 100,
        count: dateGroups[date].count
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
      .slice(-30)

    const totalCost = Math.round(dataWithDates.reduce((sum, row) => sum + (row.amount || 0), 0) * 100) / 100

    return {
      dataWithDates,
      costsByType,
      dailyCosts,
      totalCost
    }
  }, [data])

  const { dataWithDates, costsByType, dailyCosts, totalCost } = processedData

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f', '#ffbb28', '#ff8042', '#8dd1e1', '#d084d0']

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm">
              <span style={{ color: entry.color }}>{entry.name}: </span>
              ${entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'by-type', name: 'By Service Type' },
    { id: 'timeline', name: 'Timeline' },
    { id: 'breakdown', name: 'Cost Breakdown' }
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Spending</p>
              <p className="text-2xl font-bold text-blue-600">${totalCost.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-green-600">{dataWithDates.length.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Average per Transaction</p>
              <p className="text-2xl font-bold text-purple-600">
                ${dataWithDates.length > 0 ? (totalCost / dataWithDates.length).toFixed(6) : '0.00'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Cost Overview</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costsByType.slice(0, 8)} margin={{ left: 20, right: 20, top: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="type" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="totalCost" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Services Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {costsByType.slice(0, 6).map((service, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 truncate" title={service.fullType}>
                    {service.fullType}
                  </h4>
                  <p className="text-2xl font-bold text-indigo-600">${service.totalCost}</p>
                  <p className="text-sm text-gray-600">{service.count.toLocaleString()} transactions</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'by-type' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Costs by Service Type</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costsByType} margin={{ left: 60, right: 20, top: 20, bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="type" 
                    angle={-45} 
                    textAnchor="end" 
                    height={120}
                    fontSize={10}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="totalCost" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {costsByType.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={item.fullType}>
                        {item.fullType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${item.totalCost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        ${(item.totalCost / item.count).toFixed(6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {((item.totalCost / totalCost) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Daily Cost Timeline</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyCosts} margin={{ left: 20, right: 20, top: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    fontSize={10}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="totalCost" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Recent Daily Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dailyCosts.slice(-8).map((day, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700">{day.date}</h4>
                    <p className="text-lg font-bold text-indigo-600">${day.totalCost}</p>
                    <p className="text-sm text-gray-600">{day.count} transactions</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'breakdown' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Cost Distribution</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Top Services Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costsByType.slice(0, 8)}
                        dataKey="totalCost"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label={({type, percent}) => `${type}: ${(percent * 100).toFixed(1)}%`}
                        labelLine={false}
                      >
                        {costsByType.slice(0, 8).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-800 mb-2">Largest Cost Category</h4>
                  {costsByType.length > 0 && (
                    <>
                      <p className="text-lg text-blue-700">{costsByType[0].fullType}</p>
                      <p className="text-2xl font-bold text-blue-600">${costsByType[0].totalCost.toLocaleString()}</p>
                      <p className="text-sm text-blue-600">
                        {((costsByType[0].totalCost / totalCost) * 100).toFixed(1)}% of total costs
                      </p>
                    </>
                  )}
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-800 mb-2">Most Frequent Service</h4>
                  {costsByType.length > 0 && (
                    <>
                      <p className="text-lg text-green-700">
                        {costsByType.reduce((prev, current) => (prev.count > current.count) ? prev : current).fullType}
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {costsByType.reduce((prev, current) => (prev.count > current.count) ? prev : current).count.toLocaleString()} transactions
                      </p>
                    </>
                  )}
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-semibold text-purple-800 mb-2">Peak Day</h4>
                  {dailyCosts.length > 0 && (
                    <>
                      <p className="text-lg text-purple-700">
                        {dailyCosts.reduce((prev, current) => (prev.totalCost > current.totalCost) ? prev : current).date}
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        ${dailyCosts.reduce((prev, current) => (prev.totalCost > current.totalCost) ? prev : current).totalCost.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}