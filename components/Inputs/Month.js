import { IconCircleNumber3 } from '@tabler/icons'
import React from 'react'
import { useIntl } from 'react-intl';

const Month = ({ months, setSelectedMonth, selectedMonth }) => {
    const intl = useIntl();

    const getText = (id) => intl.formatMessage({ id });

    return (
        <div className="ml-4">
            <div className="flex items-center mb-2">
                <IconCircleNumber3 color="rgb(110 231 183)" />
                <span className="ml-2">{getText('months.title')}</span>
            </div>
            <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="prompt-box"
            >
                <option value="">{getText('months.title')}</option>
                {months.map((m) => (
                    <option key={m} value={getText(`months.${m}`)}>
                        {getText(`months.${m}`)}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default Month