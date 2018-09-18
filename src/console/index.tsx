import { render } from 'react-dom';
import * as React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Index from './page/Index';
render(
  <Router>
    <Route path="/" component={Index} />
  </Router>,
  document.getElementById('root')
);