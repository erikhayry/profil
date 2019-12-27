import * as React from "react";
import {useState} from "react";
import AvataaarsCustomerizer from '../avatar-customizer/avatar-customizer';
import {IAvatarAttributes} from "../avatar-customizer/avatar-options";
import styles from './editor.module.css';
import a11y from '../../styles/a11y.module.css';
import classNames from 'classnames';
import {X, Save, Trash2, CornerDownLeft} from "react-feather";
import {IUser} from "../../../../typings/index";

interface IProps {
    user: IUser;
    onSave: (editedUser: IUser) => void
    onDelete: (userId: string) => void
    onCancel: () => void
}

export const Editor = ({user, onSave, onCancel, onDelete} :IProps) => {
    const [editedUser, setEditedUser] = useState<IUser>(user)
    function handleAvatarChange(customizedAttributes: IAvatarAttributes) {
        console.log("handleAvatarChange")
        setEditedUser({
            ...editedUser,
            avatar: customizedAttributes
        })
    }

    function handleNameChange(event: React.ChangeEvent<HTMLInputElement>){
        setEditedUser({
            ...editedUser,
            name: event.target.value
        })
    }

    function handleUndo(user: IUser){
        console.log("handleUndo", user)
        setEditedUser({
            ...user
        })
    }

    return (
        <div className={styles.editor}>
            <button className={styles.closeBtn} onClick={onCancel}>
                <X color="white"/>
                <span className={a11y.hidden}>Stäng</span>
            </button>
            <div className={styles.editorInner}>
                <div className={styles.body}>
                    <AvataaarsCustomerizer
                        value={editedUser.avatar}
                        name={editedUser.name}
                        onChange={handleAvatarChange}
                        onNameChange={handleNameChange}
                    />
                </div>
                <div className={styles.footer}>
                    <button className={styles.btn} onClick={() =>
                        handleUndo(user)
                    }>
                        <CornerDownLeft color="white" />Ångra ändringar
                    </button>
                    <button className={styles.btn} onClick={() => {
                        onDelete(editedUser.id)
                    }}>
                        <Trash2 color="white"/>Radera
                    </button>
                    <button className={styles.btn} onClick={() => {
                        onSave(editedUser)
                    }}>
                        <Save color="white" />Spara
                    </button>
                </div>
            </div>
        </div>
    )
};
