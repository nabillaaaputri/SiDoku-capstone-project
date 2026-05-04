import React from 'react'

export const Table = ({ 
  headers, 
  rows, 
  onRowClick,
  loading = false,
  emptyText = 'No data found'
}) => {
  if (loading) return <div className="text-center py-8">Loading...</div>
  
  if (!rows || rows.length === 0) {
    return <div className="text-center py-8 text-neutral-500">{emptyText}</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-neutral-100 border-b border-neutral-300">
          <tr>
            {headers.map((header) => (
              <th 
                key={header.key} 
                className="px-6 py-3 text-left font-semibold text-neutral-700"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr 
              key={idx}
              className="border-b border-neutral-200 hover:bg-neutral-50 cursor-pointer"
              onClick={() => onRowClick?.(row)}
            >
              {headers.map((header) => (
                <td key={header.key} className="px-6 py-4 text-neutral-900">
                  {header.render ? header.render(row[header.key], row) : row[header.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
