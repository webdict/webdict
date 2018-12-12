/*
  # -1 - 等待中
  #  0 - 未注册
  #  1 - 已登录
  #  2 - 开关
  #  4 - 高级
  #  8 - 超级
  # 16 - 管理员
 */
export default flag => {
  const data = [{
    name: '网词快查',
    icon: 'dashboard',
    path: '/'
  }, {
    name: '查词历史',
    icon: 'table',
    path: '/history/_',
    hide: flag === -1
  }, {
    name: '网页笔记',
    icon: 'read',
    path: '/webnote/_',
    hide: flag === -1
  }, {
    name: '新增词条',
    icon: 'plus-circle',
    path: '/add/',
    hide: (flag & 11) !== 11
  }, {
    name: '重新定义',
    icon: 'edit',
    path: '/def/',
    hide: flag < 1
  }, {
    name: '同步数据',
    icon: 'sync',
    path: '/sync',
    hide: flag !== 0
  }, {
    name: '切换账号',
    icon: 'user',
    path: '/user',
    hide: flag > 0
  }];
  return filter(data);
}

const filter = data =>
  data.reduce((a, e) => {
    if (e.hide) {
      return a;
    }
    if (e.children) {
      const children = filter(e.children);
      if (!children.length) {
        return a;
      }
      e.children = children;
    }
    a.push(e);
    return a;
  }, []);
