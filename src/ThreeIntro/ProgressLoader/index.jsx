import { useState, useEffect } from "react";
import React from "react";
import { useNavigate } from 'react-router-dom';
import { isMobile } from "react-device-detect";
import "./styles.css";

const ProgressLoader = ({width}) => {
    const loadText = isMobile ? "TOUCH AND HOLD TO CONTINUE" : "HOLD DOWN LEFT CLICK TO CONTINUE"

    const [title, setTitle] = useState("");
    const [readyState, setReadyState] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{
        setTitle(loadText);
    }, []);

    useEffect(()=>{
        if (width >= 100){
            setTitle("ENTER");
            setReadyState(true);
        }
    }, [width])

    const onTitleClick = () => {
        navigate('/home');
    }

    return <div className="progress-loader">
        <div className="progress-bar" style={{ width: `${width}%` }} onClick={readyState ? onTitleClick : ()=>{}}></div>
        <p className={`progress-title ${readyState ? "flashing-underline" : 0}`}>{title}</p>
    </div>;
}

export default ProgressLoader;