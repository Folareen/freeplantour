import { useRouter } from 'next/router'

import React from 'react'

import { useIntl } from 'react-intl'



const Nav = () => {

    const currentLanguage = useIntl().locale



    const changeLanguage = (e, language) => {
        e.preventDefault()
        const urlObj = window.location
        if (['es', 'en', 'de', 'fr', 'pt'].includes(urlObj.pathname.substring(1, 3))){
        window.location.href = urlObj.origin + `/${language}` + urlObj.pathname.substring(3, urlObj.pathname.length)
        } else {
        window.location.href = urlObj.origin + `/${language}` + urlObj.pathname
        }
    }



    return (

        <nav class="front">

            <button style={{ textDecoration: currentLanguage === "es" ? "none" : "underline" }} onClick={(e) => changeLanguage(e, 'es')}>ES</button>

            {" | "}

            <button style={{ textDecoration: currentLanguage === "en" ? "none" : "underline" }} onClick={(e) => changeLanguage(e, 'en')}>EN</button>

            {" | "}

            <button  style={{ textDecoration: currentLanguage === "de" ? "none" : "underline" }} onClick={(e) => changeLanguage(e, 'de')}>DE</button>

            {" | "}

            <button style={{ textDecoration: currentLanguage === "fr" ? "none" : "underline" }} onClick={(e) => changeLanguage(e, 'fr')} >FR</button>

            {" | "}

            <button  style={{ textDecoration: currentLanguage === "pt" ? "none" : "underline" }} onClick={(e) => changeLanguage(e, 'pt')}>PT</button>

            &nbsp;&nbsp;



        </nav>

    )

}



export default Nav