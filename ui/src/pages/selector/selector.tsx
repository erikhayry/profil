import * as React from "react";
import '../../styles/base.css';
import {AvatarList} from "../../components/avatar/avatar-list";
import {getSearchFromUrl} from "../../../../utils/data-handler";
import styles from "./selector.module.css";

export const Selector = () => {
    const { href } =  getSearchFromUrl(window.location);

    function onClick(id: string){
        const { host, pathname, search } = new URL(href);
        const currentUserDelim = search ? `&` : '?';

        window.location.href = `${href}${currentUserDelim}profileCurrentUser=${id}`;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Profil</h1>
            <AvatarList onClick={onClick}/>
        </div>
    )
}
