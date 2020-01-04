import {IAvatarAttributes} from "../avatar/profil-avatar";

export enum Emotion{
    HAPPY= 'happy',
    SAD = 'sad'
}

export function withEmotion(avatar: IAvatarAttributes, emotion?: Emotion):IAvatarAttributes{
    let ret = {
        ...avatar
    }
    if(emotion === Emotion.HAPPY){
        ret.mouthType = 'Smile';
        ret.eyebrowType = 'RaisedExcited';
        ret.eyeType = 'Hearts';
    } else if(emotion === Emotion.SAD){
        ret.mouthType = 'Disbelief';
        ret.eyebrowType = 'Angry';
        ret.eyeType = 'Surprised';
    }

    return {
        ...ret
    };
}
