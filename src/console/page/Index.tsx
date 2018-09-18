import * as React from 'react';
import { RouteComponentProps as Props } from 'react-router-dom';

interface State {
  data: any[];
}

export default class Index extends React.Component<Props, State>{
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }
  render() {
    return (
      <div>Hello, world!</div>
    );
  }
}