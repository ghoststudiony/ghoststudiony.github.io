import React, { useState } from "react";
import "./styles.css";

const About = () => {
    return (
        <div className="about-content">
            <span className="about-title">
                ABOUT ME <img className="about-title-img" src="images/ghost-pixel.gif" />
            </span>
            <p className="about-desc">I'm a creative coder and designer who blends programming, design, and production to build projects that stretch the limits of my imagination. My work spans from developing websites for fashion and jewelry brands to crafting unique web and game experiences.</p>
            <p className="about-desc">CURRENT STACK OF THIS WEBSITE: HTML, CSS, JavaScript, React, Three.js, react-three-fiber</p>
        </div>
    )
}

export default About;