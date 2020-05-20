import * as React from "react";
import '../../styles/base.css';
import {AvatarList} from "../../components/avatar/avatar-list";
import {getSearchFromUrl} from "../../../../utils/data-handler";
import styles from "./selector.module.css";
import {Page} from "../page";

export const Selector = () => {
    const { href } = getSearchFromUrl(window.location.search);
    function onClick(id: string){
        const { search } = new URL(href);
        const currentUserDelim = search ? `&` : '?';
        window.location.href = `${href}${currentUserDelim}profileCurrentUser=${id}`;
    }

    return (
        <Page bodyClassNames={styles.page}>
            <h2 className={styles.title}>Välj profil</h2>
            <AvatarList listClassname={styles.list} onClick={onClick}/>
        </Page>
    )
};
