import { IconCircleNumber3 } from '@tabler/icons'
import React from 'react'

const Month = ({ months, setSelectedMonth, selectedMonth }) => {
    return (
        <div className="ml-4">
            <div className="flex items-center mb-2">
                <IconCircleNumber3 color="rgb(110 231 183)" />
                <span className="ml-2">Mes</span>
            </div>
            <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="prompt-box"
            >
                <option value="">Mes</option>
                {months.map((m) => (
                    <option key={m} value={m}>
                        {m}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default Month