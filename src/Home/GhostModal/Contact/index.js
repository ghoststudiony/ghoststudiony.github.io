import React, { useState } from "react";
import "./styles.css";

const Contact = () => {
    return (
        <div className="contact-content">
            <span className="contact-title">
                CONTACT <img className="contact-title-img" src="images/mail.gif" />
            </span>
            <p className="contact-desc">EMAIL: <a>ghoststudiony@gmail.com</a></p>
            <p className="contact-desc">INSTAGRAM: <a href="https://www.instagram.com/ghost_studio_ny/" target="_blank" className="contact-link">@ghost_studio_ny</a></p>
        </div>
    )
}

export default Contact;