import * as React from 'react';
import { RouteComponentProps as Props } from 'react-router-dom';

interface State {
  data: any[];
}

export default class Define extends React.Component<Props, State>{
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }
  render() {
    const { lang, word } = this.props.match.params as any;
    return (
      <div>{lang}, {word}</div>
    );
  }
}