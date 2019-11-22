import browser from "webextension-polyfill";
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Moment from 'react-moment';

class LandingContainer extends Component {
    constructor() {
        super();
        this.state = {
            url: '',
            lastVisit: '',
            host: ''
        };

        this.onWhitelist = this.onWhitelist.bind(this);
    }

    componentDidMount() {
        const { href, lastVisit } =  this.getSearch();
        const { host, pathname } = new URL(href);

        this.setState({
            href,
            host,
            pathname,
            lastVisit: parseFloat(lastVisit)
        });
    }

    getSearch(){
        let pairs = window.location.search.substring(1).split("&"),
            obj = {},
            pair,
            i;

        for ( i in pairs ) {
            if ( pairs[i] === "" ) continue;

            pair = pairs[i].split("=");
            obj[ decodeURIComponent( pair[0] ) ] = decodeURIComponent( pair[1] );
        }

        return obj;
    }

    getWhitelist(){
        return browser.storage.sync.get('whitelist')
    }

    setWhitelistItem(whitelist){
        return browser.storage.sync.set({whitelist})
    }

    onWhitelist( path ){
        const { href } = this.state;

        this.getWhitelist()
            .then(({whitelist = []}) => this.setWhitelistItem([...whitelist, path]))
            .then(() => {
                window.location.href = href;
            });
    }

    render() {
        const { host, pathname = '', lastVisit } = this.state;

        return (
            <>
                <div className="page-container">
                    <h1>Once <span>a</span> day</h1>
                    <h2 style={{
                        textAlign: 'center'
                    }}>
                        {host} already visited today
                    </h2>
                    <h3 style={{
                        textAlign: 'center'
                    }}>
                        Last visit <Moment format="YYYY-MM-DD HH:mm">{lastVisit}</Moment>
                    </h3>
                    <div className="action-container">
                        Allow multiple visits per day for website <strong>{ host }</strong>? <button aria-label={`Allow multiple visits per day for ${host}`} className="action-btn" onClick={() => {
                            this.onWhitelist(host)
                        }}>ok</button>
                        <br/>
                        {pathname.length > 1 &&
                            <>
                            or allow for path <strong>{host + pathname}</strong>?<button className="action-btn" aria-label={`Allow multiple visits per day for ${host + pathname}`} onClick={() => {
                                this.onWhitelist(host + pathname)
                                    }}>ok
                                </button>
                            </>
                        }
                    </div>
                </div>
                <div className="credit-container">
                    Background by <a href="https://ellenportin.myportfolio.com/" target="_blank">Ellen Portin</a>
                </div>
            </>
        );
    }
}

export default LandingContainer;

document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('landing-container');
    wrapper ? ReactDOM.render(<LandingContainer />, wrapper) : false;
});