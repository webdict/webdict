
import { render } from 'react-dom';
import React from 'react';
import Fetch from '../fetch';
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      passokay: '',
      passhint: '',
      loading: false,
      gender: 1,
      birday: 0,
      step: 0
    }
  }
  onSubmit = event => {
    event.preventDefault();
    const { step, loading } = this.state;
    if (loading) return;
    this.setState({ loading: true });
    if (step == 0) {
      Fetch.hintme(this.state).then(passhint => {
        console.log('passhint', passhint);
        this.setState({
          passhint,
          loading: false,
          step: passhint === null
            ? -1
            : 1
        });
      });
    } else if (step === 1) {
      Fetch.signin(this.state).then(state => {
        console.log('signin', state);
      });
    } else {
      Fetch.signup(this.state).then(state => {
        console.log('signup', state);
      });
    }
  }
  render() {
    const { step, username, passhint, password, passokay } = this.state;
    return (
      <form onSubmit={this.onSubmit}>
        <input value={username} onChange={({ target: { value } }) => this.setState({ username: value })} placeholder="手机号码" />
        {
          step === 1 && (
            <React.Fragment>
              <label>密码提示：{passhint}</label>
              <input value={password} onChange={({ target: { value } }) => this.setState({ password: value })} placeholder="登录密码" />
            </React.Fragment>
          )
        }{
          step === -1 && (
            <React.Fragment>
              <input value={password} onChange={({ target: { value } }) => this.setState({ password: value })} placeholder="设置密码" />
              <input value={passokay} onChange={({ target: { value } }) => this.setState({ passokay: value })} placeholder="确认密码" />
              <input value={passhint} onChange={({ target: { value } }) => this.setState({ passhint: value })} placeholder="密码提示" />
            </React.Fragment>
          )
        }
        <button type="submit">{step == 0 ? '下一步' : step === 1 ? '登录' : '注册'}</button>
      </form>
    );
  }
}

render(<App />, document.getElementById('root'));