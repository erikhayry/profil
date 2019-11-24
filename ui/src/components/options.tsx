import * as React from "react";
import styles from './options.module.css';
import {useEffect, useState} from "react";
import storage, {IData, IUser} from '../../../utils/storage'
import {Editor} from "./editor";

export const Options = () => {
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
            <h1>Profiler</h1>
            <p>currentUser: {config.currentUser}</p>
            <ul>
                {config.users.map(user =>
                    <li>
                        <button disabled={user.id === config.currentUser} onClick={() =>
                            setCurrentUser(user.id)
                        }>Användare {user.name}[{user.id}]</button>
                        <button onClick={() =>
                            setEditUser(user)
                        }>Ändra</button>
                        <button disabled={config.users.length === 1} onClick={() => {
                            removeUser(user.id)
                        }}>Ta bort</button>
                    </li>
                )}
            </ul>
            <button onClick={addUser}>Lägg till användare</button>
            {editUser && <Editor user={editUser} onCancel={onCloseEditor} onSave={onUpdateUser} />}
        </div>

    )
}