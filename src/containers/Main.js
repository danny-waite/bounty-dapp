import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import {
    Container,
    Menu,
    Header
  } from 'semantic-ui-react';

import { routes } from '../routes';

class Main extends Component {

    render() {
        return (
            <Router>
                <div>
                    <Menu fixed='top' inverted>
                        <Container>
                        <Menu.Item header>
                            Bounty Dapp
                        </Menu.Item>
                        <Menu.Item>
                            <Link to='/'>Home</Link>
                        </Menu.Item>
                        <Menu.Item>
                            <Link to='/posted'>Posted Bounties</Link>
                        </Menu.Item>
                        <Menu.Item>
                            <Link to='/submitted'>Submitted Bounties</Link>
                        </Menu.Item>
                        <Menu.Item>
                            <Link to='/contract'>Contract</Link>
                        </Menu.Item>
                        <Menu.Menu position='right'>
                            <Menu.Item>
                            <Link to='/bounty/create'>Create Bounty</Link>
                            </Menu.Item>
                            <Menu.Item>
                            <Link to='/account'>Account</Link>
                            </Menu.Item>
                        </Menu.Menu>
                        </Container>
                    </Menu>
                    <div style={{ right: 0, top: 40, position: "fixed", padding: 15, color: "grey" }}>{this.props.account}</div>
                    <Container text style={{ marginTop: '7em' }}>
                            <Switch>
                                {routes.map((route, index) => {
                                    return <Route key={index} path={route.path} component={route.component} exact={route.exact}/>
                                })}
                            </Switch>
                    </Container>
                </div>
        </Router>
        );
    }
}

export default Main;