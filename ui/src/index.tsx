import * as React from "react";
import * as ReactDOM from "react-dom";

import {Popup} from "./pages/popup/popup";
import {Options} from "./pages/options/options";
import {Selector} from "./pages/selector/selector";

const onPopup = document.getElementById("popup");
const onOptions = document.getElementById("options");
const onSelector = document.getElementById("selector");

// Standard Google Universal Analytics code

//@ts-ignore
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
//@ts-ignore
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),

    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)

})(window,document,'script','https://www.google-analytics.com/analytics.js','ga'); // Note: https protocol here

ga('create', 'UA-155828460-1', 'auto');

ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200

ga('require', 'displayfeatures');

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

