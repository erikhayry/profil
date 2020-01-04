import React, {useEffect, useRef} from "react";
import { Piece } from 'avataaars'
import Avatar from 'avataaars'
import map from 'lodash/map'
import styles from './avatar-customizer.module.css'
import options, {randomAvatar} from './avatar-options';
import classNames from 'classnames';
import {Edit, Plus} from "react-feather";
import a11y from "../../styles/a11y.module.css";
import {Attribute, IAvatarAttributes, IOption} from "../avatar/profil-avatar";

interface IProps {
  value: IAvatarAttributes,
  name: string,
  onChange: (newAttributes: IAvatarAttributes) => void
  onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function translate(label: string){
  switch (label){
    case 'Skin':
      return 'Hy';
    case 'Head':
      return 'Huvud & hår'
    case 'Facial Hair':
        return 'Skägg'      
    case 'Eyes':
        return 'Ögon'  
    case 'Eyebrows':
        return 'Ögonbryn'    
    case 'Accessories':
        return 'Glasögon'     
    case 'Mouth':
        return 'Mun'
    case 'Clothes':
        return 'Kläder'                                            
    default:
      return label  
  }
}

const AvataaarsCustomizer = ({value, name, onChange, onNameChange}: IProps) => {
  const [selectedTab,setSelectedTab] = React.useState<string>('top');
  const [attributes, setAttributes] = React.useState<IAvatarAttributes>(value || randomAvatar());
  const textInputRef = useRef(null);
  
  useEffect(() => {
      setAttributes(value)
  }, [value])

  function pieceClicked(attr: Attribute, val: string) {
    let newAttributes = {
      ...attributes,
      [attr]:val
    };
    setAttributes(newAttributes);
    onChange(newAttributes);
  }

  function editName(){
    textInputRef.current.focus();
    textInputRef.current.value = '';
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
      <div className={styles.inputWrapper}>
        <input className={styles.input} type="text" value={name} ref={textInputRef} onChange={onNameChange} />
        <button className={styles.inputBtn} onClick={editName}>
          <Edit color={'white'} /><span className={a11y.hidden}>Ändra namn</span>
        </button>
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
                    {translate(option.label)}
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
                    {option.values.length > 0 && <ul className={styles.pieces}>
                      {map(option.values,(val) => {
                          let attr = {
                            [option.attribute]: val
                          };
                          
                          const pieceClasses = classNames({
                            [styles.piece]: true,
                            //@ts-ignore
                            [styles.isCurrent]: attributes[option.attribute] === val,
                            [styles[`is-${option.attribute}`]]: true
                          })
                          return <li className={pieceClasses} onClick={() => pieceClicked(option.attribute,val)}>
                                  <Piece pieceSize="100" pieceType={option.type} avatarStyle={'transparent'} {...attr}/>
                                </li>
                        })
                      }                      
                    </ul>}
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
