import {IAvatarAttributes} from "../avatar/profil-avatar";

export default function timeMachine(avatarAttributes: IAvatarAttributes): IAvatarAttributes {
    let res = {
        ...avatarAttributes
    };

    if(avatarAttributes.age){
        if(avatarAttributes.age < 13){
            res.facialHairType = 'Blank';
        }

        if(avatarAttributes.age > 50){
            res.hairColor = 'SilverGray';
            res.facialHairColor = 'Platinum';
        }
    }

    return  res;
}