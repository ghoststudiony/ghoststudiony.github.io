import React, { useState } from "react";
import "./styles.css";

const Pastwork = () => {
    return (
        <div className="past-content">
            <span className="past-title">
                PAST WORK <img className="past-title-img" src="images/ghosticon.png" />
            </span>
            <a className="past-link" href="https://zaccurstudio.com/" target="_blank"><p className="past-desc">ZACCUR STUDIO</p></a>
            <a className="past-link" href="https://paidtimeoff.us/" target="_blank"><p className="past-desc">PAIDTIMEOFF</p></a>
        </div>
    )
}

export default Pastwork;