import * as React from "react";
import {IUser} from "../../../../utils/storage";
import {useState} from "react";
import AvataaarsCustomerizer from '../avatar-customizer/avatar-customizer';
import {IAvatarAttributes} from "../avatar-customizer/avatar-options";
import styles from './editor.module.css';
import a11y from '../../styles/a11y.module.css';
import classNames from 'classnames';
import {X, Save, Trash2} from "react-feather";

interface IProps {
    user: IUser;
    onSave: (editedUser: IUser) => void
    onDelete: (userId: string) => void
    onCancel: () => void
}

export const Editor = ({user, onSave, onCancel, onDelete} :IProps) => {
    const [editedUser, setEditedUser] = useState<IUser>(user)
    function handleAvatarChange(customizedAttributes: IAvatarAttributes) {
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

    return (
        <div className={styles.editor}>
            <div className={styles.editorInner}>
                <div className={styles.body}>
                    <AvataaarsCustomerizer
                        value={editedUser.avatar}
                        onChange={handleAvatarChange}
                    />
                </div>
                <div className={styles.footer}>
                    <input className={styles.input} type="text" value={editedUser.name} onChange={handleNameChange}/>
                    <button className={styles.btn} onClick={() => {
                        onSave(editedUser)
                    }}>
                        <Save color="white" />Spara
                    </button>
                    <button className={styles.closeBtn} onClick={onCancel}>
                        <X color="white"/>
                        <span className={a11y.hidden}>Stäng</span>
                    </button>
                    <button className={styles.btn} onClick={() => {
                        onDelete(editedUser.id)
                    }}>
                        <Trash2 color="white"/>Radera
                    </button>
                </div>
            </div>
        </div>
    )
};
