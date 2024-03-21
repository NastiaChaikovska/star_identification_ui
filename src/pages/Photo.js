import {useEffect, useState} from "react";

import "../styles/Photo.css";
import React from "react";
import CustomPictureInput from "../components/CustomPictureInput";

function Photo () {
    return (
        <div className={"edit-article"}>
            <CustomPictureInput/>
        </div>
    );
}

export default Photo;
