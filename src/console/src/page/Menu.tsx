import { RouteComponentProps as Props } from 'react-router-dom';
import * as React from 'react';
import { Menu, Icon } from 'antd';
const { SubMenu } = Menu;


interface State {
  data: any[];
}

export default class MyMenu extends React.Component<Props, State>{
  constructor(props: Props) {
    super(props);
    this.state = {
      data: []
    };
  }
  render() {
    return (
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        style={{ height: '100%', borderRight: 0 }}
      >
        <SubMenu key="sub1" title={<span><Icon type="user" />数据页</span>}>
          <Menu.Item key="1">关于我的</Menu.Item>
          <Menu.Item key="2">关于全体</Menu.Item>
          <Menu.Item key="3">关于词库</Menu.Item>
        </SubMenu>
        <SubMenu key="sub2" title={<span><Icon type="laptop" />编辑页</span>}>
          <Menu.Item key="5">新增词条</Menu.Item>
          <Menu.Item key="6">改进释义</Menu.Item>
          <Menu.Item key="7">上传发音</Menu.Item>
        </SubMenu>
        <SubMenu key="sub3" title={<span><Icon type="notification" />个人页</span>}>
          <Menu.Item key="9">我的贡献</Menu.Item>
          <Menu.Item key="4">我的收藏</Menu.Item>
          <Menu.Item key="8">我的设置</Menu.Item>
        </SubMenu>
      </Menu>
    );
  }
}