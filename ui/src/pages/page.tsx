import {default as React, FunctionComponent, ReactElement} from "react";
import styles from "./page.module.css";

interface IProps {
    bodyClassNames?: string;
    titleClassNames?: string;
}

export const Page: FunctionComponent<IProps> = ({bodyClassNames = '', titleClassNames = '', children}) => {
    return (
        <div className={`${styles.container} ${bodyClassNames}`}>
            <h1 className={`${styles.header} ${titleClassNames}`}>Profil</h1>
            <div className={styles.body}>
                {children}
            </div>
        </div>
    )
};
