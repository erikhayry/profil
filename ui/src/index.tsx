import * as React from "react";
import * as ReactDOM from "react-dom";

import {Popup} from "./components/popup/popup";

const onPopup = document.getElementById("popup");

if(onPopup){
    ReactDOM.render(
        <Popup  />,
        document.getElementById("popup")
    );
} else {
    ReactDOM.render(
        <Popup  />,
        document.getElementById("options")
    );
}

