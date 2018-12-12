import React from 'react';
import Fetch from '../fetch';


export const UserContext = React.createContext();


export default class Context extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      onChange: this.setState.bind(this),
      username: null,
      userflag: -1
    }
  }

  componentDidMount() {
    Fetch.contxt().then(context => {
      this.setState(context);
    });
  }

  render() {
    const { Provider } = UserContext;
    const { children } = this.props;
    return (
      <Provider value={this.state}>{children}</Provider>
    );
  }
}