import * as React from "react";
import * as ReactDOM from "react-dom";

import {Popup} from "./pages/popup/popup";
import {Options} from "./pages/options/options";
import {Selector} from "./pages/selector/selector";
import {init} from "../../utils/ga";

const onPopup = document.getElementById("popup");
const onOptions = document.getElementById("options");
const onSelector = document.getElementById("selector");
const ga = init();

if(onPopup){
    ga('send', 'pageview', '/popup.html');
    ReactDOM.render(
        <Popup  />,
        document.getElementById("popup")
    );
} else if(onOptions) {
    ga('send', 'pageview', '/options.html');
    ReactDOM.render(
        <Options  />,
        document.getElementById("options")
    );
} else if(onSelector) {
    ga('send', 'pageview', '/selector.html');
    ReactDOM.render(
        <Selector  />,
        document.getElementById("selector")
    );
}

