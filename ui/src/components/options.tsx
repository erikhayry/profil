import * as React from "react";
import styles from './options.module.css';
import {useEffect, useState} from "react";
import storage, {IData} from '../../../utils/storage'

export const Options = () => {
    const [config, setConfig ] = useState<IData>({
        currentUser: undefined,
        users: []
    });

    useEffect(() => {
        console.log('useEffect')
        storage.getData()
            .then(updateView)
    }, []);

    function updateView({ currentUser, users }: IData){
        setConfig({
            currentUser, users
        });
    }

    function addUser() {
        console.log("addUser")
        storage.addUser()
            .then(updateView);
    }
    
    function setCurrentUser(userId: string) {
        console.log("setCurrentUser", userId)
        storage.setCurrentUser(userId)
            .then(updateView);
    }
    
    return(
        <div className={styles.container}>
            <h1>Profiler</h1>
            <p>currentUser: {config.currentUser}</p>
            {config.users.map(({ id }) =>
                <button disabled={id === config.currentUser} onClick={() =>
                    setCurrentUser(id)
                }>Användare [{id}]</button>
            )}
            <button onClick={addUser}>Lägg till användare</button>
        </div>

    )
}