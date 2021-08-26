import React from 'react'
import { Route, Redirect } from 'react-router-dom';
import Coverage from './components/coverage/Coverage';
import Dashboard from './components/dashboard/Dashboard';
import WebHeader from './components/header/WebHeader';

class Main extends React.Component<{}, {}> {
    render() {
        return (
            <div>
                <WebHeader />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/coverage/:id" component={Coverage} />
                <Redirect from='/' to='/dashboard' />
            </div>
        );
    }
}

export default Main