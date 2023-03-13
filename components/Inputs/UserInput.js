import { IconCircleNumber1 } from '@tabler/icons'
import React from 'react'
import { useIntl } from 'react-intl';

const UserInput = ({setUserInput, userInput}) => {
    const intl = useIntl();

    const getText = (id) => intl.formatMessage({ id });

    return (
        <div>
            <div className="flex items-center">
                <IconCircleNumber1 color="rgb(110 231 183)" />
                <span className="ml-2">
                    {getText('new.location')}<font color="#CA0935">*</font>
                </span>
            </div>
            {
                <input
                    type="text"
                    placeholder="Escribe tu destino"
                    className="prompt-box"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                />
            }
        </div>
    )
}

export default UserInput