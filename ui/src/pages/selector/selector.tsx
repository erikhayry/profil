import * as React from "react";
import '../../styles/base.css';
import {AvatarList} from "../../components/avatar/avatar-list";
import {getSearchFromUrl} from "../../../../utils/data-handler";
import styles from "./selector.module.css";
import {Page} from "../page";

export const Selector = () => {
    const { href } = getSearchFromUrl(window.location.search);

    function onClick(id: string){
        console.log("url", new URL(href));
        const { search } = new URL(href);
        const currentUserDelim = search ? `&` : '?';

        window.location.href = `${href}${currentUserDelim}profileCurrentUser=${id}`;
    }

    return (
        <Page>
            <AvatarList onClick={onClick}/>
        </Page>
    )
};
