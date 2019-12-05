import * as React from "react";
import * as ReactDOM from "react-dom";

import {Popup} from "./components/popup/popup";
import {Options} from "./components/options/options";

const onPopup = document.getElementById("popup");

if(onPopup){
    ReactDOM.render(
        <Popup  />,
        document.getElementById("popup")
    );
} else {
    ReactDOM.render(
        <Options  />,
        document.getElementById("options")
    );
}
