import React, { useState, useEffect } from "react";
import "./styles.css";

const Overlay = () => {
    const [isMute, setIsMute] = useState(false);

    useEffect(() => {
        const mediaElements = document.querySelectorAll('audio, video');
        mediaElements.forEach(el => {
            el.muted = isMute;
        });
    }, [isMute])

    return (
        <div className="ghost-overlay">
            <div className="ghost-overlay-btns">
                <div className="mute-btn">
                    <img className="mute-btn-img" src={isMute ? "/images/mute.png" : "/images/sound.png"} onClick={() => setIsMute(!isMute)} />
                </div>
            </div>
        </div>
    )
}

export default Overlay;