import Avatar from "avataaars";
import timeMachine from "../avatar-customizer/time-machine";
import * as React from "react";

export const enum Attribute {
    topType = "topType",
    accessoriesType = "accessoriesType",
    hairColor = "hairColor",
    facialHairType = "facialHairType",
    clotheType = "clotheType",
    clotheColor = "clotheColor",
    eyeType = "eyeType",
    eyebrowType = "eyebrowType",
    mouthType = "mouthType",
    skinColor = "skinColor",
    hatColor = 'hatColor',
    facialHairColor = 'facialHairColor'
}

export interface IAvatarAttributes {
    topType: string;
    accessoriesType: string;
    hairColor: string;
    hatColor?: string;
    facialHairType: string;
    clotheType: string;
    clotheColor: string;
    eyeType: string;
    eyebrowType: string;
    mouthType: string;
    skinColor: string;
    facialHairColor: string
    age?:number;

}
export interface IOption {
    label: string,
    type: string,
    attribute: Attribute,
    values: string[],
    colorAttribute?: Attribute,
    colors?: Record<string, string>,
    transform?: string,
    hats?: string[],
    hatColors?: Record<string, string>
}

interface IProps {
    attributes: IAvatarAttributes,
    className?: string
}

export const ProfilAvatar: React.FC<IProps> = ({attributes, className = ''}) => {
    return (
        <div className={className}>
            <Avatar
                avatarStyle='transparent'
                {...timeMachine(attributes)}
            />
        </div>
    )

};
