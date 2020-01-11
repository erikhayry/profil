import {default as React, FunctionComponent, ReactElement} from "react";
import {CSSTransition} from "react-transition-group";
import styles from "./overlay.module.css";


export const Overlay: FunctionComponent = ({children}) => {
    return (<CSSTransition
        mountOnEnter
        unmountOnExit
        in={true}
        appear={true}
        timeout={0}
        classNames={{
            appear: styles.overlayAppear,
            appearDone: styles.overlayAppearDone,
            enter: styles.overlayEnter,
            enterActive: styles.overlayEnterActive,
            exit: styles.overlayExit,
            exitActive: styles.overlayExitActive
        }}
    >
        {children}
    </CSSTransition>)
}
