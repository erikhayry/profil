import * as React from "react";
import {useEffect, useState} from "react";
import styles from './options.module.css';
import storage from '../../../../utils/storage'
import {Editor} from "../editor/editor";
import classNames from 'classnames';
import {Plus} from "react-feather";
import a11y from "../../styles/a11y.module.css";
import {IServerUser} from "../../../../typings/index";
import server from "../../../../utils/server";
import timeMachine from "../avatar-customizer/time-machine";
import {AvatarRevealer} from "../avatar-customizer/avatar-revealer";
import {Emotion, withEmotion} from "../avatar-customizer/emotion-converter";
import {Title} from "../title/title";
import {ProfilAvatar} from "../avatar/profil-avatar";
import { CSSTransition } from "react-transition-group";

interface ViewState {
    users: IServerUser[],
    editUser?: IServerUser,
    deleteUser?: IServerUser,
    newUser?: IServerUser
}

export const Options = () => {
    const [view, setView ] = useState<ViewState>({
        users: []
    });

    useEffect(() => {
        console.log('useEffect');
        storage.getUsers()
            .then(() => updateView());
    }, []);

    useEffect(() => {
        if(view.newUser){
            window.setTimeout(updateView, 4000)
        } else {
            //remove timeout
        }
    }, [view.newUser]);


    async function updateView(newUser?: IServerUser){
        const users = await storage.getUsers();
        setView({
            users,
            editUser: undefined,
            deleteUser: undefined,
            newUser
        });
    }

    async function clear(){
        await storage.clearApp();
        updateView();
    }

    async function addUser() {
        console.log("addUser");
        const user =  await storage.addUser();

        updateView(user);

    }

    function onCloseEditor() {
        setView({
            ...view,
            editUser: undefined
        })
    }

    function onConfirmedRemoveUser(userId: string){
        storage.deleteUser(userId)
            .then(() => updateView());
    }

    function removeUser(user: IServerUser){
        console.log("removeUser", user);
        setView({
            ...view,
            deleteUser: user
        })
    }

    function onDeleteBtnMouseEvent(event:React.MouseEvent<HTMLElement>){
        if(event.type === "mouseenter"){
            setView({
                ...view,
                deleteUser: {
                    ...view.deleteUser,
                    avatar: withEmotion(view.editUser.avatar, Emotion.SAD)
                }
            })
        } else {
            setView({
                ...view,
                deleteUser: {
                    ...view.editUser
                }
            })
        }
    }

    function onUndoDeleteBtnMouseEvent(event:React.MouseEvent<HTMLElement>){
        if(event.type === "mouseenter"){
            setView({
                ...view,
                deleteUser: {
                    ...view.deleteUser,
                    avatar: withEmotion(view.editUser.avatar, Emotion.HAPPY)
                }
            })
        } else {
            setView({
                ...view,
                deleteUser: {
                    ...view.editUser
                }
            })
        }
    }

    function onUpdateUser(editedUser: IServerUser){
        console.log("onUpdateUser", editedUser);
        const index = view.users.findIndex(({ id }) => view.editUser.id === id);
        view.users[index] = editedUser;

        setView({
            ...view,
            editUser: undefined
        });
        server.setData(view)
            .then(() => updateView());
    }
    
    const userListClasses = classNames({
        [styles.userList]: true,
        [styles.isDisabled]: Boolean(view.editUser),
        [styles.hasNew]: Boolean(view.newUser),
    });

    const titleClasses = classNames({
        [styles.title]: true,
        [styles.isDisabled]: Boolean(view.editUser)
    });

    return(
        <div className={styles.container}>
            <Title title={'Profil'} className={titleClasses} />
            <ul className={userListClasses}>
                {view.users.reverse().map((user, index) => {
                    const userListItemClasses = classNames({
                        [styles.userListItem]: true,
                        [styles.isNew]: user.id === view.newUser?.id,
                    });
                    const userListItemBtnClasses = classNames({
                        [styles.avatarButton]: true,
                        [styles.isNew]: user.id === view.newUser?.id,
                    });
                    const ghostAvatarWrapperClasses = classNames({
                        [styles.ghostAvatarWrapper]: true,
                        [styles.hasNewSibling]: user.id === view.newUser?.id,
                    });
                    return (
                        <CSSTransition
                            in={true}
                            appear={true}
                            timeout={index * 100}
                            mountOnEnter
                            unmountOnExit
                            classNames={{
                                appear: styles.userListItemAppear,
                                appearDone: styles.userListItemAppearDone,
                                enter: styles.userListItemEnter,
                                enterActive: styles.userListItemEnterActive,
                                exit: styles.userListItemExit,
                                exitActive: styles.userListItemExitActive
                            }}
                        >
                            <li className={userListItemClasses} key={user.id}>
                                <button className={userListItemBtnClasses} disabled={!!view.editUser} onClick={() =>
                                            setView({
                                                ...view,
                                                editUser: user
                                            })
                                }>
                                    {view.newUser?.id === user.id &&
                                        <AvatarRevealer
                                            attributes={timeMachine(user.avatar)}
                                        />
                                    }
                                    {view.newUser?.id !== user.id &&
                                    <ProfilAvatar
                                        attributes={timeMachine(user.avatar)}
                                    />
                                    }
                                </button>
                                {index === 0 && <div className={ghostAvatarWrapperClasses}>
                                    <ProfilAvatar attributes={user.avatar} className={styles.ghostAvatar} />
                                </div>}
                                <h2 className={styles.name}>{user.name}</h2>
                            </li>
                        </CSSTransition>
                    )
                })}
            </ul>

            <button className={styles.temp} onClick={clear}>Clear app</button>

            {!view.editUser && <button className={styles.addUserButton} onClick={addUser}>
                <Plus color={'white'} size={50}/>
                <span className={a11y.hidden}>Lägg till användare</span>
            </button>}

            {view.editUser && <Editor user={view.editUser} onCancel={onCloseEditor} onSave={onUpdateUser} onDelete={removeUser} />}

            {view.deleteUser && <div className={styles.prompt}>
                <h1 className={styles.promptTitle}>Är du säker du vill radera {view.deleteUser.name} och all hens historik?</h1>
                <div className={styles.promptAvatarWrapper}>
                    <ProfilAvatar attributes={view.deleteUser.avatar} className={styles.promptAvatar}/>
                </div>
                <ul className={styles.promptOptions}>
                    <li className={styles.promptOption}>
                        <button className={styles.promptBtn} onMouseEnter={onDeleteBtnMouseEvent} onMouseLeave={onDeleteBtnMouseEvent} onClick={() => {
                            onConfirmedRemoveUser(view.deleteUser.id)
                        }}>Ja</button>
                    </li>
                    <li>
                        <button className={styles.promptBtn} onMouseEnter={onUndoDeleteBtnMouseEvent} onMouseLeave={onUndoDeleteBtnMouseEvent} onClick={() => {
                            ga('send', 'event', 'Options', 'undo delete');
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
