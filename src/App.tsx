import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import Main from './Main';
import Login from './components/login/Login';
import { mock } from './Config';

if (mock) {
  require('./mock/projectApi');
  require('./mock/coverageApi');
  require('./mock/userApi');
}

function App() {
  const isLogin = localStorage.getItem("token") ? true : false;
  return (
    <Switch>
      <Route path="/login" component={Login} />
      {/* <Route path="/success" component={Success} /> */}
      {
        isLogin ?
          <Route path="/" component={Main} />
          :
          <Redirect to="/login" />
      }
    </Switch>
  );
}

export default App;
