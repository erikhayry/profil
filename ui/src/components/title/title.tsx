import React from "react"
import styles from './title.module.css';

interface IProps {
    title: string;
    className?: string;
}

export const Title = ({title,className = ''} :IProps) => {
    return (
        <h1 className={`${styles.title} ${className}`}>
            {title.split('').map(letter => <span>{letter}</span>)}
        </h1>
    )
}