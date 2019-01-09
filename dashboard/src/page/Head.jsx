import React, {useContext} from 'react';
import {Layout} from 'antd';
import UserContext from '..';
const {Header} = Layout;

export default function Head() {
  const {username, userflag} = useContext(UserContext);
  return (
    <Header style={{color: 'white'}}>{userflag === -1 ? null : (userflag & 31) === 0 ? '未登录' : username}</Header>
  );
}
