import * as React from "react";
import '../../styles/base.css';
import {AvatarList} from "../../components/avatar/avatar-list";
import {getSearchFromUrl} from "../../../../utils/data-handler";
import styles from "./selector.module.css";
import {Page} from "../page";

export const Selector = () => {
    const { href } = getSearchFromUrl(window.location.search);
    console.log('href', href)
    function onClick(id: string){
        const { search } = new URL(href);
        console.log('search', search)
        const currentUserDelim = search ? `&` : '?';
        console.log('currentUserDelim', currentUserDelim)
        console.log(`${href}${currentUserDelim}profileCurrentUser=${id}`)
        window.location.href = `${href}${currentUserDelim}profileCurrentUser=${id}`;
    }

    return (
        <Page bodyClassNames={styles.page}>
            <h2>Välj profil</h2>
            <AvatarList onClick={onClick}/>
        </Page>
    )
};
