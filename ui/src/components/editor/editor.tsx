import * as React from "react";
import {IUser} from "../../../../utils/storage";
import {useState} from "react";
import AvataaarsCustomerizer from '../avatar-customizer/avatar-customizer';
import {IAvatarAttributes} from "../avatar-customizer/avatar-options";
import styles from './editor.module.css';
import classNames from 'classnames';

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
        <>
            <div className={styles.top}>
                <AvataaarsCustomerizer value={editedUser.avatar} onChange={handleAvatarChange} />
            </div>
            <div className={styles.body}>
                <input className={styles.input} type="text" value={editedUser.name} onChange={handleNameChange}/>
                <button className={styles.btn} onClick={() => {
                    onSave(editedUser)
                }}>Spara</button>
                <button className={styles.btn} onClick={onCancel}>Stäng</button>
                <button className={styles.btn} onClick={() => {
                    onDelete(editedUser.id)
                }}>Radeara</button>
            </div>
        </>
    )
};
