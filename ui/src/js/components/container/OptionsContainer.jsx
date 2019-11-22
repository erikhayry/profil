import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Avatar from 'avataaars'
import { addUser, getData, setCurrentUser } from './../../../../../utils';

class OptionsContainer extends Component {
    constructor() {
        super();
        this.state = {
            currentUser: undefined,
            users: []
        };
        this.restore = this.restore.bind(this);
        this.addNewUser = this.addNewUser.bind(this);
        this.setNewCurrentUser = this.setNewCurrentUser.bind(this);
    }
    componentDidMount() {
        this.restore()
    }

    restore(){
        console.log("restore")
        getData().then((app) => {
                console.log('restore - ', app)
                const { currentUser, users  } = app;
                this.setState({
                    currentUser, users
                });
            });
    }

    addNewUser(){
        addUser()
            .then(this.restore);
    }

    setNewCurrentUser(id){
        setCurrentUser(id)
            .then(this.restore);
    }

    render() {
        const { currentUser, users = [] } = this.state;
        return (
            <>
                <div className="page-container">
                    <h1>Profiler</h1>
                    <p>currentUser: {currentUser}</p>
                    {users.map(({ id }) =>
                        <button disabled={id === currentUser} onClick={() =>
                            this.setNewCurrentUser(id)
                        }>Användare [{id}]</button>
                    )}
                    <button onClick={this.addNewUser}>Lägg till användare</button>
                </div>
            </>
        );
    }
}

export default OptionsContainer;

const wrapper = document.getElementById("options-container");
wrapper ? ReactDOM.render(<OptionsContainer />, wrapper) : false;