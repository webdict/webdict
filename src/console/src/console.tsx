import 'antd/dist/antd.css';
import { render } from 'react-dom';
import * as React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './page/Header';
import Define from './page/Define';
import Index from './page/Index';
import Menu from './page/Menu';
import { Layout } from 'antd';
const { Sider, Content } = Layout;


render(
  <Router>
    <Layout>
      <Route component={Header} />
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Route component={Menu} />
        </Sider>
        <Layout style={{ padding: '16px 0 0 16px' }}>
          <Content style={{ background: 'white', padding: '16px' }}>
            <Switch>
              <Route path="/define/:lang/:word" component={Define} />
              <Route path="/" component={Index} />
            </Switch>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  </Router>,
  document.getElementById('root')
);
