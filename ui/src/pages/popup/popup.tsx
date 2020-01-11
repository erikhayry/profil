import * as React from "react";
import {useEffect, useState} from "react";
import '../../styles/base.css';
import a11y from '../../styles/a11y.module.css';
import {Sliders} from 'react-feather';
import styles from './popup.module.css';
import storage from '../../../../utils/storage'
import classNames from 'classnames';
import {browser} from "webextension-polyfill-ts";
import {IServerUser, MESSAGE_TYPE, SUPPORTED_CLIENT} from "../../../../typings/index";
import useInitialClientState from "../../../utils/onMessage";
import {Emotion, withEmotion} from "../../components/avatar-customizer/emotion-converter";
import {ProfilAvatar} from "../../components/avatar/profil-avatar";
import {Title} from "../../components/title/title";
import {CLIENT_ORIGINS, IClientOrigins} from "../../../../utils/client-handler";

interface IView {
    users: IServerUser[],
    clients: IClientOrigins[],
    currentUser?: IServerUser,
    clientId?: SUPPORTED_CLIENT,
    currentHoveredUserId?: string
}

export const Popup = () => {
    const [view, setView ] = useState<IView>({
        users: [],
        clients: CLIENT_ORIGINS
    });
    const initialClientState = useInitialClientState();

    useEffect(() => {
        console.log("initialClientState", initialClientState);
        setView({
            ...view,
            currentUser: view.users.find(user => user.id === initialClientState.currentUser),
            clientId: initialClientState?.clientId
        })
    }, [initialClientState]);

    useEffect(() => {
        console.log('useEffect')
        async function init() {
            const users = await storage.getUsers();
            setView({
                ...view,
                users
            });
            browser.runtime.sendMessage({type: MESSAGE_TYPE.REQUEST_INITIAL_STATE, clientId: view.clientId});
        }

        init();
    }, []);

    function handleSetCurrentUser(userId: string){
        setView({
            ...view,
            currentUser: view.users.find(user => user.id === userId)
        });
        browser.runtime.sendMessage({type: MESSAGE_TYPE.CURRENT_USER_FORM_UI, userId, clientId: view.clientId});
        window.close();
    }

    async function clearUser(userId: string) {
        console.log("clearUser", userId)
        storage.clearUser(userId)
    }

    const isLegit = Boolean(view.clientId);

    function getClientList(isSmall = false){
        const clientsClasses = classNames({
            [styles.client]: true,
            [styles[`isSmall`]]: isSmall,
        });

        console.log(`is-${view.clients[0].id.replace(/ /g, '')}`)

        return (<ul className={clientsClasses}>
            {view.clients.map((client, index) => (
                <li key={index} className={classNames({
                    [styles.client]: true,
                    [styles[`is-${client.id.replace(/ /g, '')}`]]: true,
                })}>
                    <a href={client.url} target='_newtab'>
                        <img src={browser.runtime.getURL(client.imagePath)} alt={client.name}/>
                    </a>
                </li>
            ))}
        </ul>)
    }

    function onDeleteBtnMouseEvent(event:React.MouseEvent<HTMLElement>, userId: string){
        if(event.type === "mouseenter"){
            setView({
                ...view,
                currentHoveredUserId: userId
            })
        } else {
            setView({
                ...view,
                currentHoveredUserId: undefined
            })
        }
    }

    return(
        <div className={styles.container}>
            <div className={styles.header}>
                <Title title={'Profil'} />
            </div>

            {!isLegit &&
            <>
                <h2>Webbsidor som stödjs</h2>
                {getClientList()}
            </>
            }

            {isLegit && <>
                <ul className={styles.userList}>
                    {view.currentUser &&
                        <li className={classNames({
                            [styles.userListItem]: true,
                            [styles.isCurrent]: true,
                            [styles.isLegit]: isLegit
                        })}>
                            <div
                                className={styles.avatarButton}
                            >
                                <ProfilAvatar
                                    attributes={view.currentUser.avatar}
                                />
                            </div>
                            <div className={styles.name}>
                                Inloggad som <strong>{view.currentUser.name}</strong>
                            </div>
                        </li>
                    }
                </ul>
                {view.users.length > 1 &&
                    <>
                        <hr className={styles.hr}/>
                        <h2>Byt användare</h2>
                        <ul className={styles.userList}>
                            {view.users.filter(user => {
                                if(!view.currentUser) {
                                    return true
                                }

                                return view.currentUser.id !== user.id
                            })
                                .map(user => {
                                        const userListItemClasses = classNames({
                                            [styles.userListItem]: true,
                                            [styles.isLegit]: isLegit
                                        });
                                        return (
                                            <li className={userListItemClasses}>
                                                <button
                                                    className={styles.avatarButton}
                                                    disabled={!isLegit}
                                                    onClick={() =>
                                                        handleSetCurrentUser(user.id)
                                                    }
                                                    onMouseEnter={(event) => {
                                                        onDeleteBtnMouseEvent(event, user.id)
                                                    }}
                                                    onMouseLeave={(event) => {
                                                        onDeleteBtnMouseEvent(event, user.id)
                                                    }}
                                                >
                                                    <div>
                                                        <ProfilAvatar
                                                            attributes={withEmotion(user.avatar, user.id === view.currentHoveredUserId ? Emotion.HAPPY : Emotion.SAD)}
                                                        />
                                                    </div>
                                                    <div className={styles.name}><span className={a11y.hidden}>Byt till användare till </span>{user.name}</div>
                                                </button>
                                            </li>
                                        )
                                    }
                                )}
                        </ul>
                    </>
                }

            </>}
            <div className={classNames({
                [styles.menu]: true,
                [styles.isLegit]: isLegit
            })}>
                <button className={styles.settingsBtn} onClick={() => {
                    browser.runtime.openOptionsPage();
                }}>
                    <Sliders color="white"/>
                </button>
            </div>
        </div>
    )
};
