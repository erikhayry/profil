import browser from "webextension-polyfill";
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Avatar from 'avataaars'

class OptionsContainer extends Component {
    constructor() {
        super();
        this.state = {
            user: undefined
        };
        this.setUser = this.setUser.bind(this);
    }

    restore(){
        console.log("restore", )
        browser.storage.sync.get('user')
            .then((result) => {
                this.setState({
                    user: result.user
                });
            });
    }

    componentDidMount() {
        this.restore()
    }

    setUser(user) {
        browser.storage.sync.set({
            user
        }).then(() => {
            this.restore()
        });
    }

    render() {
        const { user } = this.state;
        return (
            <>
                <div className="page-container">
                    <h1>Profiler</h1>
                    <div>
                        Your avatar:
                        <Avatar
                            style={{width: '100px', height: '100px'}}
                            avatarStyle='Circle'
                            topType='LongHairMiaWallace'
                            accessoriesType='Prescription02'
                            hairColor='BrownDark'
                            facialHairType='Blank'
                            clotheType='Hoodie'
                            clotheColor='PastelBlue'
                            eyeType='Happy'
                            eyebrowType='Default'
                            mouthType='Smile'
                            skinColor='Light'
                        />
                    </div>
                    <p>user: {user}</p>
                    <button disabled={user === 1} onClick={() =>
                        this.setUser(1)
                    }>Användare 1</button>
                    <button disabled={user === 2} onClick={() =>
                        this.setUser(2)
                    }>Användare 2</button>
                </div>
            </>
        );
    }
}

export default OptionsContainer;

const wrapper = document.getElementById("options-container");
wrapper ? ReactDOM.render(<OptionsContainer />, wrapper) : false;