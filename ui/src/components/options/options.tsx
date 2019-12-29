import * as React from "react";
import {useEffect, useState} from "react";
import styles from './options.module.css';
import storage from '../../../../utils/storage'
import {Editor} from "../editor/editor";
import Avatar from "avataaars";
import classNames from 'classnames';
// @ts-ignore
import {Plus} from "react-feather";
import a11y from "../../styles/a11y.module.css";
import {IServerUser} from "../../../../typings/index";
import {Emotion, withEmotion} from "../avatar-customizer/emotion-converter";

interface ViewState {
    users: IServerUser[],
    editUser?: IServerUser,
    deleteUser?: IServerUser,
}

export const Options = () => {
    const [view, setView ] = useState<ViewState>({
        users: []
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
            editUser: undefined,
            deleteUser: undefined
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

    function onConfirmedRemoveUser(userId: string){
        storage.deleteUser(userId)
            .then(updateView);
    }

    function removeUser(user: IServerUser){
        console.log("removeUser", user);
        setView({
            ...view,
            deleteUser: user
        })

    }

    function onUpdateUser(editedUser: IServerUser){
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
                            </button>
                            <h2 className={styles.name}>{user.name}</h2>
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
            {view.deleteUser && <div className={styles.prompt}>
                <h1>Är du säker du vill radera {view.deleteUser.name} och all hens historik</h1>
                <Avatar
                    avatarStyle='transparent'
                    {...view.deleteUser.avatar}
                />
                <ul>
                    <li>
                        <button onClick={() => {
                            onConfirmedRemoveUser(view.deleteUser.id)
                        }}>Ja</button>
                    </li>
                    <li>
                        <button onClick={() => {
                            setView({
                                ...view,
                                deleteUser: undefined
                            })
                        }}>Nej</button>
                    </li>
                </ul>
            </div>}
        </div>

    )
};
