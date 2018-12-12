import React, { useContext } from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import menudata from '../data/menu';
import UserContext from '..';
export default function MyMenu({ location: { pathname: full } }) {
  const { userflag } = useContext(UserContext);
  const data = menudata(userflag);
  const path = find(data, full);
  return (
    <Menu
      style={{ height: '100%', borderRight: 0 }}
      openKeys={data.map(({ name }) => name)}
      selectedKeys={path ? [path] : []}
      mode="inline">
      {render(data)}
    </Menu>
  );
}


const { SubMenu, Item } = Menu;
const render = data => {
  return data.map(({ name, icon, path, children }) => children
    ? <SubMenu key={name}
      title={
        <span>
          <Icon type={icon} />
          <span>{name}</span>
        </span>
      }>
      {render(children)}
    </SubMenu>
    : <Item key={path}>
      <Link to={path} replace>
        <Icon type={icon} />
        {name}
      </Link>
    </Item>
  );
};


const find = (data, full, path = '') => data.reduce((p, { path, children }) => {
  if (children) {
    return find(children, full, p);
  }
  if (path.length > p.length && full.startsWith(path)) {
    return path;
  }
  return p;
}, path);