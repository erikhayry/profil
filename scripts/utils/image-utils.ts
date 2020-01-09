import {IAvatarAttributes} from "../../ui/src/components/avatar/profil-avatar";
import Avatar from "avataaars";
import React from 'react';
import ReactDOMServer from 'react-dom/server';
// @ts-ignore
import convert from 'svg-to-canvas';
// @ts-ignore
import domify from 'domify';

export async function getImageFromAvatar(attributes: IAvatarAttributes): Promise<string> {
    return new Promise<string>(res => {
        // @ts-ignore
        const el = React.createElement(Avatar, {...attributes});
        const svg = ReactDOMServer.renderToString(el);
        convert(domify(svg), (canvas: any) => {
            res(canvas.toDataURL())
        });
    });
}
