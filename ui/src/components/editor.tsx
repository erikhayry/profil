import * as React from "react";
import {IUser} from "../../../utils/storage";
import {useState} from "react";
import AvataaarsCustomerizer from './avatar-customizer/avatar-customizer';
import {IAvatarAttributes} from "./avatar-customizer/avatar-options";

interface IProps {
    user: IUser;
    onSave: (editedUser: IUser) => void
    onCancel: () => void
}

export const Editor = ({user, onSave, onCancel} :IProps) => {
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
        <div>
            <AvataaarsCustomerizer value={editedUser.avatar} onChange={handleAvatarChange} />
            <input type="text" value={editedUser.name} onChange={handleNameChange}/>
            <button onClick={() => {
                onSave(editedUser)
            }}>Spara</button>
            <button onClick={onCancel}>Stäng</button>
        </div>
    )
};