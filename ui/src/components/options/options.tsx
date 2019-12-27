import * as React from "react";
import styles from './options.module.css';
import {useEffect, useState} from "react";
import storage from '../../../../utils/storage'
import {Editor} from "../editor/editor";
import Avatar from "avataaars";
import classNames from 'classnames';
// @ts-ignore
import browser from 'webextension-polyfill';
import {Plus, X} from "react-feather";
import a11y from "../../styles/a11y.module.css";
import {IUser} from "../../../../typings/index";

interface ViewState {
    users: IUser[],
    editUser: IUser | undefined
}

export const Options = () => {
    const [view, setView ] = useState<ViewState>({
        users: [],
        editUser: undefined
    });

    useEffect(() => {
        console.log('useEffect')
        storage.getData()
            .then(updateView)
    }, []);


    async function updateView(){
        const {users} = await storage.getData();
        setView({
            users,
            editUser: undefined
        });
    }

    async function clear(){
        await storage.clearApp();
        updateView();
    }

    async function addUser() {
        console.log("addUser");
        await storage.addUser()
        updateView();

    }

    function onCloseEditor() {
        setView({
            ...view,
            editUser: undefined
        })
    }

    function removeUser(userId: string){
        console.log("removeUser", userId);
        storage.deleteUser(userId)
            .then(updateView);
    }

    function onUpdateUser(editedUser: IUser){
        console.log("onUpdateUser", editedUser);
        const index = view.users.findIndex(({ id }) => view.editUser.id === id);
        view.users[index] = editedUser;

        setView({
            ...view,
            editUser: undefined
        });
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
                        [styles.userListItem]: true
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

            <button onClick={clear}>Clear app</button>

            {!view.editUser && <button className={styles.addUserButton} onClick={addUser}>
                <Plus color={'white'} size={50}/>
                <span className={a11y.hidden}>Lägg till användare</span>
            </button>}
            {view.editUser && <Editor user={view.editUser} onCancel={onCloseEditor} onSave={onUpdateUser} onDelete={removeUser} />}
        </div>

    )
};
