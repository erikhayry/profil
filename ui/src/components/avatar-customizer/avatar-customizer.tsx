import React from "react";
import { Piece } from 'avataaars'
import Avatar from 'avataaars'
import map from 'lodash/map'
import styles from './avatar-customizer.module.css'
import options, {Attribute, IAvatarAttributes, IOption} from './avatar-options';

interface IProps {
  value: IAvatarAttributes,
  onChange: (newAttributes: IAvatarAttributes) => void
}

const AvataaarsCustomizer = (props: IProps) => {
  const [selectedTab,setSelectedTab] = React.useState<string>('top');
  const [attributes,setAttributes] = React.useState<IAvatarAttributes>(props.value || {
    topType:'LongHairMiaWallace',
    accessoriesType:'Prescription02',
    hairColor:'BrownDark',
    facialHairType:'Blank',
    clotheType:'Hoodie',
    clotheColor:'PastelBlue',
    eyeType:'Happy',
    eyebrowType:'Default',
    mouthType:'Smile',
    skinColor:'Light',
  });

  function pieceClicked(attr: Attribute, val: string) {
    let newAttributes = {
      ...attributes,
      [attr]:val
    };
    setAttributes(newAttributes);
    if (props.onChange) {
      props.onChange(newAttributes);
    }
  }

  return (
    <>
      <div className={styles.avatar}>
        <Avatar
            style={{width: '300px', height: '300px', margin: '0 auto', display: 'block'}}
            avatarStyle='transparent'
            {...attributes}
          />
      </div>
      <div className={styles.avatarOptions}>
        <ul className={styles.tabs}>
          {
            map(options, (option) => {
              return (
                  <li
                    className={styles.tab + ' ' + (selectedTab == option.type ? styles.selectedTab : '')}
                    onClick={() => setSelectedTab(option.type)}
                    >
                    {option.label}
                  </li>
                );
            })
          }
        </ul>
        <div className={styles.tabpanes}>
          {
            map(options, (option: IOption) => {
              return (
                  <div className={styles.tabpane + ' ' + (selectedTab == option.type ? styles.visible : '')}>
                    <ul className={styles.pieces}>
                      {
                          map(option.values,(val) => {
                          let attr = {
                            [option.attribute]: val
                          };
                          return <li className={styles.piece} onClick={() => pieceClicked(option.attribute,val)}>
                                  <Piece pieceSize="100" pieceType={option.type} avatarStyle={'transparent'} {...attr}/>
                                  {
                                    (val === 'Blank' || val === 'NoHair') &&
                                    <div className={styles.none}>(none)</div>
                                  }
                                </li>
                        })
                      }
                    </ul>
                    <ul className={styles.colors}>
                      {
                        option.colors && (option.type !== 'top' || option.hats.indexOf(attributes.topType) === -1) &&
                          map(option.colors,(color,colorName) => {
                            return <li
                                    className={styles.color}
                                    style={{backgroundColor:color}}
                                    onClick={() => pieceClicked(option.colorAttribute,colorName)}
                                  />
                          })
                      }
                      {
                        option.hatColors && option.hats.indexOf(attributes.topType) !== -1 &&
                          map(option.hatColors,(color,colorName) => {
                            return <li
                                    className={styles.color}
                                    style={{backgroundColor:color}}
                                    onClick={() => pieceClicked(Attribute.hatColor, colorName)}
                                  />
                          })
                      }
                    </ul>
                  </div>
                );
            })
          }
        </div>
      </div>
    </>
  );
}

export default AvataaarsCustomizer;
