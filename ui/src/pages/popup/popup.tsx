import * as React from "react";
import {useEffect, useState} from "react";
import '../../styles/base.css';
import a11y from '../../styles/a11y.module.css';
import {Sliders} from 'react-feather';
import styles from './popup.module.css';
import storage from '../../../../utils/storage'
import classNames from 'classnames';
import {browser} from "webextension-polyfill-ts";
import {IServerUser, IUserData, MESSAGE_TYPE, SUPPORTED_CLIENT} from "../../../../typings/index";
import useInitialClientState from "../../../utils/onMessage";
import {Emotion, withEmotion} from "../../components/avatar-customizer/emotion-converter";
import {ProfilAvatar} from "../../components/avatar/profil-avatar";
import {CLIENT_ORIGINS, IClientOrigins} from "../../../../utils/client-handler";
import {Page} from "../page";

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

    const isLegit = Boolean(view.clientId);

    function getClientList(isSmall = false){
        const clientsClasses = classNames({
            [styles.clients]: true,
            [styles[`isSmall`]]: isSmall,
        });

        return (<ul className={clientsClasses}>
            {view.clients.map((client, index) => (
                <li key={index} className={classNames({
                    [styles.client]: true,
                    [styles[clientIdToClassName(client.id)]]: true,
                })}>
                    <a href={client.url} target='_newtab'>
                        <img src={browser.runtime.getURL(client.imagePath)} alt={client.name}/>
                    </a>
                </li>
            ))}
        </ul>)
    }

    function onBtnMouseEvent(event:React.MouseEvent<HTMLElement>, userId: string){
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

    function getUserClientList(user: IServerUser){
        return (
            <ul className={styles.avatarClients}>
                {getUserClientUsage(user.clientsData).map(({clientId, isUsing}) => (
                    <li className={classNames({
                        [styles.avatarClient]: true,
                        [styles.isUsing]: isUsing,
                        [styles[clientIdToClassName(clientId)]]: true
                    })}>
                        <img src={browser.runtime.getURL(view.clients.find(({id}) => clientId === id)?.imagePath)} alt={clientId}/>
                        <span className={a11y.hidden}>{clientId}</span>
                    </li>
                ))}
            </ul>
        )
    }

    function getUserClientUsage(clientsData: IUserData): {clientId: string, isUsing: Boolean}[] {
        const ret = [];

        for(const key in clientsData){
            const clientData = clientsData[key];

            ret.push({
                clientId: key,
                isUsing: clientData.some(({data}) => Boolean(data))
            })
        }

        return ret;
    }

    function clientIdToClassName(id = ''){
        return `is-${id.replace(/ /g, '')}`
    }

    return(
        <Page bodyClassNames={styles.container}>
            <div className={styles.containerInner}>

                {!isLegit &&
                <>
                    <h2>Webbsidor som stödjs</h2>
                    {getClientList()}
                </>
                }

                {isLegit && <>
                    {view.currentUser &&
                        <>
                            <div className={styles.currentUser}>
                                <div className={styles.currentUserBgOuter}>
                                    <div className={styles.currentUserBg}>
                                        <ProfilAvatar
                                            attributes={view.currentUser.avatar}
                                        />
                                    </div>
                                </div>
                                <div className={styles.currentUserAvatar}>
                                    <ProfilAvatar
                                        attributes={withEmotion(view.currentUser.avatar, view.currentHoveredUserId ? Emotion.SAD : null)}
                                    />
                                </div>
                                <div className={styles.currentUserName}>
                                    Inloggad på {view.clientId} som <strong>{view.currentUser.name}</strong>
                                </div>
                                <div className={styles.currentUserClientList}>
                                    {getUserClientList(view.currentUser)}
                                </div>
                            </div>
                        </>
                    }
                    {view.users.length > 1 &&
                        <>
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
                                                        className={styles.userListItemButton}
                                                        disabled={!isLegit}
                                                        onClick={() =>
                                                            handleSetCurrentUser(user.id)
                                                        }
                                                        onMouseEnter={(event) => {
                                                            onBtnMouseEvent(event, user.id)
                                                        }}
                                                        onMouseLeave={(event) => {
                                                            onBtnMouseEvent(event, user.id)
                                                        }}
                                                    >
                                                        <ProfilAvatar
                                                            attributes={withEmotion(user.avatar, user.id === view.currentHoveredUserId ? Emotion.HAPPY : null)}
                                                            className={styles.avatar}
                                                        />
                                                        <div className={styles.name}><span className={a11y.hidden}>Byt till användare till </span>{user.name}</div>
                                                    </button>
                                                    {getUserClientList(user)}
                                                </li>
                                            )
                                        }
                                    )}
                            </ul>
                        </>
                    }

                </>}
            </div>
            <div className={classNames({
                [styles.footer]: true,
                [styles.isFixed]: isLegit && view.users.length > 1
            })}>
                <button className={styles.settingsBtn} onClick={() => {
                    browser.runtime.openOptionsPage();
                }}>
                    Inställningar <Sliders color="white"/>
                </button>
            </div>
        </Page>
    )
};
