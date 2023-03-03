import React from 'react'

const Nav = ({ currentLanguage, setCurrentLanguage }) => {
    return (
        <nav class="front">
            <a href="#" style={{ textDecoration: currentLanguage === "es" ? "none" : "underline" }} onClick={() => setCurrentLanguage("es")}>ES</a>
            {" | "}
            <a href="#" style={{ textDecoration: currentLanguage === "en" ? "none" : "underline" }} onClick={() => setCurrentLanguage("en")}>EN</a>
            {" | "}
            <a href="#" style={{ textDecoration: currentLanguage === "de" ? "none" : "underline" }} onClick={() => setCurrentLanguage("de")}>DE</a>
            {" | "}
            <a href="#" style={{ textDecoration: currentLanguage === "fr" ? "none" : "underline" }} onClick={() => setCurrentLanguage("fr")}>FR</a>
            {" | "}
            <a href="#" style={{ textDecoration: currentLanguage === "pt" ? "none" : "underline" }} onClick={() => setCurrentLanguage("pt")}>PT</a>
            &nbsp;&nbsp;
            <a href="#" target="_blank">SUBSCRIBE</a>
            &nbsp;&nbsp;

            <div class="topnav">
                <div id="myLinks">
                    <a href="#news">News</a>
                    <a href="#contact">Contact</a>
                    <a href="#about">About</a>
                </div>
                <a href="javascript:void(0);" class="icon" onclick="myFunction()">
                    <i class="fa fa-bars"></i>
                </a>
            </div>


        </nav>)
}

export default Nav