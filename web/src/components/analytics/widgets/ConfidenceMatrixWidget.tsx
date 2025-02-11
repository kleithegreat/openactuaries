import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MOCK_CONFIDENCE_MATRIX } from '@/lib/mock/analytics'

export function ConfidenceMatrixWidget({ settings, onUpdateSettings }) {
  const [matrix, setMatrix] = useState(MOCK_CONFIDENCE_MATRIX)
  const confidenceLevels = ['Very Low', 'Low', 'Medium', 'High', 'Very High']

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Confidence Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-1">
          <div className="col-span-1"></div>
          {['Incorrect', 'Correct', 'Total'].map((header) => (
            <div key={header} className="text-sm font-medium text-center">
              {header}
            </div>
          ))}

          {confidenceLevels.map((level, i) => (
            <React.Fragment key={level}>
              <div className="text-sm font-medium">{level}</div>
              {matrix[i]?.slice(0, 2).map((value, j) => (
                <div
                  key={j}
                  className="p-2 text-center rounded"
                  style={{
                    backgroundColor: `rgba(37, 99, 235, ${value/100})`,
                    color: value > 50 ? 'white' : 'black'
                  }}
                >
                  {value}%
                </div>
              ))}
              <div className="p-2 text-center">
                {matrix[i][2]}
              </div>
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}