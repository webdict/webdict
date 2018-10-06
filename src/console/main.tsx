import { render } from 'react-dom';
import * as React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import Define from './page/Define';
import Index from './page/Index';
render(
  <Router>
    <Switch>
      <Route path="/define/:lang/:word" component={Define} />
      <Route path="/" component={Index} />
    </Switch>
  </Router>,
  document.getElementById('root')
);