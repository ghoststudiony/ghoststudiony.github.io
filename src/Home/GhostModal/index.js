import React, { useEffect, useRef } from "react";
import "./styles.css";
import About from "./About";
import Pastwork from "./Pastwork";
import Contact from "./Contact";
import Merch from "./Merch";
import { isMobile } from "react-device-detect";

const GhostModal = ({ active, setClickedModel }) => {
    const matrixWidth = isMobile ? 800 : 1000;

    const timeRef = useRef(null);
    const modalRef = useRef(null);

    const renderContent = () => {
        switch (active) {
            case "About":
                return <About />
            case "Pastwork":
                return <Pastwork />
            case "Contact":
                return <Contact />;
            case "Merch":
                return <Merch />;
            default:
                return <About />
        }

    }

    useEffect(() => {
        const ghostStr = 'GHOSTSTUDIO鬼FREESTYLEPROGRAMMINGTESTZONE';

        const canvas = document.getElementById('Matrix');
        const context = canvas.getContext('2d');

        console.log("WIDTh HEIGHT", window.innerHeight, modalRef.current.innerWidth);

        canvas.width = matrixWidth;
        canvas.height = window.innerHeight;

        const frames = 1200 / 30; // 50 frames
        const fontSize = canvas.width / frames;

        const columns = Math.floor(canvas.height / fontSize);
        const rainDrops = [];

        for (let x = 0; x < columns; x++) {
            rainDrops[x] = 1;
        }

        const draw = () => {
            // Fade out existing text gradually without a solid background:
            context.globalCompositeOperation = 'destination-out';
            context.fillStyle = 'rgba(0, 0, 0, 0.15)';
            context.fillRect(0, 0, canvas.width, canvas.height);

            // Return to normal drawing mode
            context.globalCompositeOperation = 'source-over';
            context.fillStyle = '#0F0';
            context.font = fontSize + 'px "Press Start 2P"';

            for (let i = 0; i < rainDrops.length; i++) {
                const text = ghostStr.charAt(Math.floor(Math.random() * ghostStr.length));
                context.fillText(text, (rainDrops[i] - 1) * fontSize, i * fontSize);
                rainDrops[i]++;
            }
        };

        timeRef.current = setInterval(draw, 30);

        return () => {
            clearInterval(timeRef.current);
        };
    }, []);

    return (
        <div className="ghost-modal" hidden={false} ref={modalRef}>
            <div className="close-icon" onClick={() => setClickedModel(null)}>
                <img className="close-icon-img" src="images/close-icon.png" />
            </div>
            <div className="ghost-modal-content">
                {renderContent()}
            </div>
            <div className="ghost-modal-bg">
            </div>
            <div className="matrix-container">
                <canvas id="Matrix"></canvas>
            </div>
        </div>
    );
};

export default GhostModal;
