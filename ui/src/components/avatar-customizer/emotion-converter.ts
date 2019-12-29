import options, {IAvatarAttributes, IOption} from "./avatar-options";

export enum Emotion{
    HAPPY= 'happy',
    SAD = 'sad'
}

export function withEmotion(avatar: IAvatarAttributes, emotion?: Emotion):IAvatarAttributes{
    if(emotion === Emotion.HAPPY){
        avatar.mouthType = 'Smile';
        avatar.eyebrowType = 'RaisedExcited';
    } else if(emotion === Emotion.SAD){
        avatar.mouthType = 'Disbelief';
        avatar.eyebrowType = 'Angry';
    }

    return {
        ...avatar
    };
}
