import * as React from "react";
import styles from './popup.module.css';
import {useEffect, useState} from "react";
import storage, {IData, IUser} from '../../../../utils/storage'
import {Editor} from "../editor";
import Avatar from "avataaars";
import classNames from 'classnames';

export const Popup = () => {
    const [config, setConfig ] = useState<IData>({
        currentUser: undefined,
        users: []
    });
    const [editUser, setEditUser] = useState<IUser | undefined>(undefined);

    useEffect(() => {
        console.log('useEffect')
        storage.getData()
            .then(updateView)
    }, []);

    function updateView({ currentUser, users }: IData){
        console.log("updateView", currentUser, users )
        setConfig({
            currentUser, users
        });
    }

    function addUser() {
        console.log("addUser");
        storage.addUser()
            .then(updateView);
    }
    
    function setCurrentUser(userId: string) {
        console.log("setCurrentUser", userId)
        storage.setCurrentUser(userId)
            .then(updateView);
    }

    function onCloseEditor() {
        setEditUser(undefined)
    }

    function removeUser(userId: string){
        console.log("removeUser", userId);
        const index = config.users.findIndex(({ id }) => userId === id);
        config.users.splice(index, 1);

        if(userId === config.currentUser){
            config.currentUser = config.users[0].id;
        }

        storage.setData(config)
            .then(updateView);
    }

    function onUpdateUser(editedUser: IUser){
        console.log("onUpdateUser", editedUser);
        const index = config.users.findIndex(({ id }) => editUser.id === id);
        config.users[index] = editedUser;

        setEditUser(undefined);
        storage.setData(config)
            .then(updateView);
    }

    
    return(
        <div className={styles.container}>
            <ul className={styles.userList}>
                {config.users.map(user => {
                    const userListItemClasses = classNames({
                        [styles.userListItem]: true,
                        [styles.isCurrent]: user.id === config.currentUser
                    });
                    return (
                        <li className={userListItemClasses}>
                            <button className={styles.avatarButton} onClick={() =>
                                setCurrentUser(user.id)
                            }>
                                <Avatar
                                    style={{width: '100px', height: '100px'}}
                                    avatarStyle='Circle'
                                    {...user.avatar}
                                />
                                <div className={styles.name}>{user.name}</div>
                            </button>
                            <button className={styles.button} onClick={() =>
                                setEditUser(user)
                            }>Ändra</button>
                            <button className={classNames({
                                [styles.button]: true,
                                [styles.right]: true
                            })} onClick={() => {
                                removeUser(user.id)
                            }}>Ta bort</button>
                        </li>
                    )
                })}
                <li className={styles.userListItem}>
                    <button className={styles.addUserButton} onClick={addUser}>Lägg till användare</button>
                </li>
            </ul>
            {editUser && <Editor user={editUser} onCancel={onCloseEditor} onSave={onUpdateUser} />}
        </div>

    )
}
