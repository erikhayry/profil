import * as React from "react";
import styles from './options.module.css';
import {useEffect, useState} from "react";
import storage, {IData, IUser} from '../../../../utils/storage'
import {Editor} from "../editor/editor";
import Avatar from "avataaars";
import classNames from 'classnames';
// @ts-ignore
import browser from 'webextension-polyfill';
import {MESSAGE_TYPE} from "../../../../scripts/background";
import {Plus, X} from "react-feather";
import a11y from "../../styles/a11y.module.css";

interface ViewState {
    currentUser: string;
    users: IUser[],
    editUser: IUser | undefined
}

export const Options = () => {
    const [view, setView ] = useState<ViewState>({
        currentUser: undefined,
        users: [],
        editUser: undefined
    });

    useEffect(() => {
        console.log('useEffect')
        storage.getData()
            .then(updateView)
    }, []);

    function updateView({ currentUser, users }: IData){
        console.log("updateView", currentUser, users )
        setView({
            currentUser, 
            users, 
            editUser: undefined
        });
    }

    function addUser() {
        console.log("addUser");
        storage.addUser()
            .then(updateView);
    }

    async function setCurrentUser(userId: string) {
        console.log("setCurrentUser", userId)
        const currentUser = await storage.getUser(userId);
        console.log(" - currentUser", currentUser)
        browser.runtime.sendMessage({type: MESSAGE_TYPE.CURRENT_USER, data: currentUser});
        storage.setCurrentUser(userId)
            .then(updateView);
    }

    function onCloseEditor() {
        setView({
            ...view,
            editUser: undefined
        })
    }

    function removeUser(userId: string){
        console.log("removeUser", userId);
        const index = view.users.findIndex(({ id }) => userId === id);
        view.users.splice(index, 1);

        //if(userId === config.currentUser){
            view.currentUser = view.users[0].id;
        //}

        storage.setData(view)
            .then(updateView);
    }

    function onUpdateUser(editedUser: IUser){
        console.log("onUpdateUser", editedUser);
        const index = view.users.findIndex(({ id }) => view.editUser.id === id);
        view.users[index] = editedUser;

        setView({
            ...view,
            editUser: undefined
        })
        storage.setData(view)
            .then(updateView);
    }
    
    const userListClasses = classNames({
        [styles.userList]: true,
        [styles.isDisabled]: !!view.editUser
    });

    return(
        <div className={styles.container}>
            <ul className={userListClasses}>
                {view.users.map(user => {
                    const userListItemClasses = classNames({
                        [styles.userListItem]: true,
                        [styles.isCurrent]: user.id === view.currentUser
                    });
                    return (
                        <li className={userListItemClasses}>
                            <button className={styles.avatarButton} disabled={!!view.editUser} onClick={() =>
                                        setView({
                                            ...view,
                                            editUser: user
                                        })
                            }>
                                <Avatar
                                    avatarStyle='transparent'
                                    {...user.avatar}
                                />
                                <div className={styles.name}>{user.name}</div>
                            </button>
                        </li>
                    )
                })}
            </ul>
            {!view.editUser && <button className={styles.addUserButton} onClick={addUser}>
                <Plus color={'white'} size={50}/>
                <span className={a11y.hidden}>Lägg till användare</span>
            </button>}
            {view.editUser && <Editor user={view.editUser} onCancel={onCloseEditor} onSave={onUpdateUser} onDelete={removeUser} />}
        </div>

    )
};
