import * as React from "react";
import * as ReactDOM from "react-dom";

import {Popup} from "./components/popup/popup";
import {Options} from "./components/options/options";

const onPopup = document.getElementById("popup");
const onOptions = document.getElementById("options");
const onSelector = document.getElementById("selector");

if(onPopup){
    ReactDOM.render(
        <Popup  />,
        document.getElementById("popup")
    );
} else if(onOptions) {
    ReactDOM.render(
        <Options  />,
        document.getElementById("options")
    );
} else if(onSelector) {
    ReactDOM.render(
        <Options  />,
        document.getElementById("options")
    );
}

