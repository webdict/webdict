import { RouteComponentProps as Props } from 'react-router-dom';
import * as React from 'react';
import { Layout } from 'antd';
const { Header } = Layout;


interface State {
  data: any[];
}

export default class MyHeader extends React.Component<Props, State>{
  constructor(props: Props) {
    super(props);
    this.state = {
      data: []
    };
  }
  render() {
    return (
      <Header style={{ color: 'white' }}>
        webdict
      </Header>
    );
  }
}