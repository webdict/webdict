import 'antd/dist/antd.css';
import { render } from 'react-dom';
import * as React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import Context from './conf/Context';
import Head from './page/Head';
import Main from './page/Main';
import Hist from './page/Hist';
import Note from './page/Note';
import MyMenu from './page/Menu';
import { Layout, LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';

const { Sider, Content } = Layout;


render(
  <LocaleProvider locale={zh_CN}>
    <Context>
      <Router>
        <Layout>
          <Route component={Head} />
          <Layout>
            <Sider width={160} style={{ background: '#fff' }}>
              <Route component={MyMenu} />
            </Sider>
            <Layout style={{ padding: '16px 0 0 16px' }}>
              <Content className="page-content">
                <Switch>
                  <Route path="/history/:page" component={Hist} />
                  <Route path="/webnote/:page" component={Note} />
                  <Route path="/" component={Main} />
                </Switch>
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </Router>
    </Context>
  </LocaleProvider>,
  document.getElementById('root')
);


export { UserContext as default } from './conf/Context';
