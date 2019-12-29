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

const options: IOption[] = [
    {
        label:'Skin',
        type:'skinColor',
        attribute: Attribute.skinColor,
        values:[],
        colorAttribute:Attribute.skinColor,
        colors:{
            "Tanned":"#FD9841",
            "Yellow":"#F8D25C",
            "Pale":"#FFDBB4",
            "Light":"#EDB98A",
            "Brown":"#D08B5B",
            "DarkBrown":"#AE5D29",
            "Black":"#614335"
        }
    },
    {
        label:'Head',
        type:'top',
        attribute: Attribute.topType,
        values:[
            "NoHair",
            "Eyepatch",
            "Hat",
            "Hijab",
            "Turban",
            "WinterHat1",
            "WinterHat2",
            "WinterHat3",
            "WinterHat4",
            "LongHairBigHair",
            "LongHairBob",
            "LongHairBun",
            "LongHairCurly",
            "LongHairCurvy",
            "LongHairDreads",
            "LongHairFrida",
            "LongHairFro",
            "LongHairFroBand",
            "LongHairNotTooLong",
            "LongHairShavedSides",
            "LongHairMiaWallace",
            "LongHairStraight",
            "LongHairStraight2",
            "LongHairStraightStrand",
            "ShortHairDreads01",
            "ShortHairDreads02",
            "ShortHairFrizzle",
            "ShortHairShaggyMullet",
            "ShortHairShortCurly",
            "ShortHairShortFlat",
            "ShortHairShortRound",
            "ShortHairShortWaved",
            "ShortHairSides",
            "ShortHairTheCaesar",
            "ShortHairTheCaesarSidePart"
            ],
        colorAttribute:Attribute.hairColor,
        colors: {
            "Auburn":"#A55728",
            "Black":"#2C1B18",
            "Blonde":"#B58143",
            "BlondeGolden":"#D6B370",
            "Brown":"#724133",
            "BrownDark":"#4A312C",
            "PastelPink":"#F59797",
            "Platinum":"#ECDCBF",
            "Red":"#C93305",
            "SilverGray":"#E8E1E1"
        },
        hats:[
            "Hat",
            "Hijab",
            "Turban",
            "WinterHat1",
            "WinterHat2",
            "WinterHat3",
            "WinterHat4",
        ],
        hatColors:{
            "Black":"#262E33",
            "Blue01":"#65C9FF",
            "Blue02":"#5199E4",
            "Blue03":"#25557C",
            "Gray01":"#E6E6E6",
            "Gray02":"#929598",
            "Heather":"#3C4F5C",
            "PastelBlue":"#B1E2FF",
            "PastelGreen":"#A7FFC4",
            "PastelOrange":"#FFDEB5",
            "PastelRed":"#FFAFB9",
            "PastelYellow":"#FFFFB1",
            "Pink":"#FF488E",
            "Red":"#FF5C5C",
            "White":"#FFFFFF"
  
        }
    },
    {
        label:'Facial Hair',
        type:'facialHair',
        attribute: Attribute.facialHairType,
        values:[
            "Blank",
            "BeardMedium",
            "BeardLight",
            "BeardMajestic",
            "MoustacheFancy",
            "MoustacheMagnum"
          ],
        colorAttribute: Attribute.facialHairColor,
        colors: {
            "Auburn":"#A55728",
            "Black":"#2C1B18",
            "Blonde":"#B58143",
            "BlondeGolden":"#D6B370",
            "Brown":"#724133",
            "BrownDark":"#4A312C",
            "Platinum":"#ECDCBF",
            "Red":"#C93305"
        }
    },
    {
        label:'Eyes',
        type:'eyes',
        attribute: Attribute.eyeType,
        transform:'scale(2) translate(14px,16px)',
        values:[
            "Close",
            "Cry",
            "Default",
            "Dizzy",
            "EyeRoll",
            "Happy",
            "Hearts",
            "Side",
            "Squint",
            "Surprised",
            "Wink",
            "WinkWacky"
          ],
    },{
        label:'Eyebrows',
        type:'eyebrows',
        attribute: Attribute.eyebrowType,
        transform:'scale(2) translate(13px,18px)',
        values:[
            "Angry",
            "AngryNatural",
            "Default",
            "DefaultNatural",
            "FlatNatural",
            "RaisedExcited",
            "RaisedExcitedNatural",
            "SadConcerned",
            "SadConcernedNatural",
            "UnibrowNatural",
            "UpDown",
            "UpDownNatural"
          ]
    },{
        label:'Accessories',
        type:'accessories',
        attribute: Attribute.accessoriesType,
        values:[
            "Blank",
            "Kurt",
            "Prescription01",
            "Prescription02",
            "Round",
            "Sunglasses",
            "Wayfarers"
          ]
    },{
        label:'Mouth',
        type:'mouth',
        attribute: Attribute.mouthType,
        transform:'scale(2.5) translate(14px,12px)',
        values:[
            "Concerned",
            "Default",
            "Disbelief",
            "Eating",
            "Grimace",
            "Sad",
            "ScreamOpen",
            "Serious",
            "Smile",
            "Tongue",
            "Twinkle",
            "Vomit"
          ]
    },
    {
        label:'Clothes',
        type:'clothe',
        attribute: Attribute.clotheType,
        values:[
            "BlazerShirt",
            "BlazerSweater",
            "CollarSweater",
            "GraphicShirt",
            "Hoodie",
            "Overall",
            "ShirtCrewNeck",
            "ShirtScoopNeck",
            "ShirtVNeck"
        ],
        colorAttribute: Attribute.clotheColor,
        colors: {
            "Black":"#262E33",
            "Blue01":"#65C9FF",
            "Blue02":"#5199E4",
            "Blue03":"#25557C",
            "Gray01":"#E6E6E6",
            "Gray02":"#929598",
            "Heather":"#3C4F5C",
            "PastelBlue":"#B1E2FF",
            "PastelGreen":"#A7FFC4",
            "PastelOrange":"#FFDEB5",
            "PastelRed":"#FFAFB9",
            "PastelYellow":"#FFFFB1",
            "Pink":"#FF488E",
            "Red":"#FF5C5C",
            "White":"#FFFFFF"
        }
    }
];

export default options;

function getRandomAttribute(values: string[]) {
    return  values[Math.floor(Math.random() * values.length)]
}

export function randomAvatar():IAvatarAttributes{
    const avatar = options.reduce((acc:any, {attribute, values, colorAttribute, colors}:IOption) => {
        if(attribute === Attribute.facialHairType) {
            acc[attribute] = Math.random() > 0.5 ? values[0] : getRandomAttribute(values)
        } else {
            acc[attribute] = getRandomAttribute(values);
        }

        if(colorAttribute){
            const colorKeys = Object.keys(colors);
            acc[colorAttribute] = getRandomAttribute(colorKeys);
        }
        return acc;
    },{});


    return avatar as IAvatarAttributes;
}
