import * as React from "react";
import {IUser} from "../../../utils/storage";
import {useState} from "react";
interface IProps {
    user: IUser;
    onSave: (editedUser: IUser) => void
    onCancel: () => void
}

export const Editor = ({user, onSave, onCancel} :IProps) => {
    const [editedUser, setEditedUser] = useState<IUser>(user)

    function handleNameChange(event: React.ChangeEvent<HTMLInputElement>){
        setEditedUser({
            ...editedUser,
            name: event.target.value
        })
    }

    return (
        <div>
            <input type="text" value={editedUser.name} onChange={handleNameChange}/>
            <button onClick={() => {
                onSave(editedUser)
            }}>Spara</button>
            <button onClick={onCancel}>Stäng</button>
        </div>
    )
};
