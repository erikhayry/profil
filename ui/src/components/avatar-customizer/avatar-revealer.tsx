import * as React from "react";
import {IAvatarAttributes, ProfilAvatar} from "../avatar/profil-avatar";
import styles from './avatar-randomizer.module.css'
import {useEffect, useState} from "react";
import classNames from 'classnames';

interface IProps {
    attributes: IAvatarAttributes,
    className?: string
}

const hiddenAttributes = [
    'hideTop',
    'hideSkin',
    'hideEyebrow',
    'hideEyes',
    'hideNose',
    'hideMouth',
    'hideClothing'
];

export const AvatarRevealer = ({attributes} :IProps) => {
    const initialStyles = hiddenAttributes.reduce((acc, attribute) => {
        acc[styles[attribute]] = true;
        return acc;
    }, {} as Record<string, boolean>);

    const [avatarStyles, setAvatarStyles] = useState<string>(classNames({
        ...initialStyles
    }));

    useEffect(() => {
        setTimeout(() => {
            setAvatarStyles(classNames({
                ...initialStyles,
                [styles.show]: true
            }));
        }, 100)
    }, []);

    return (
        <>
           <ProfilAvatar
               className={avatarStyles}
               attributes={attributes}
           />
        </>
    )

};