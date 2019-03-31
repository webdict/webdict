from datetime import timedelta

from secret import appkey
from secret import UUID
from secret import FLAG

from flask import render_template as render
from flask import request
from flask import session
from flask import jsonify
from flask import Flask

app = Flask(__name__)
app.secret_key = appkey
app.permanent_session_lifetime = timedelta(days=365)


def reset_session():
    from rankey import rankey
    session.clear()
    session[UUID] = rankey()
    session[FLAG] = 0


@app.before_request
def _before_request():
    if FLAG not in session:
        reset_session()


@app.after_request
def _after_request(res):
    session.permanent = True
    origin = request.headers.get('origin', '*')
    res.headers['Access-Control-Allow-Origin'] = origin
    res.headers['Access-Control-Allow-Credentials'] = 'true'
    res.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return res


# flag:
#   0 - 未注册
#   1 - 已登录
@app.route('/app/v1/contxt')
def _contxt():
    flag = session[FLAG]
    if flag == 0:
        return jsonify({
            'userflag': 0,
            'username': ''
        })
    from worker import username_of
    uuid = session[UUID]
    username = username_of(uuid)
    return jsonify({
        'userflag': 1,
        'username': username
    })


# 模糊搜索
@app.route('/app/v1/search/en/<text>')
def _search_en(text):
    if len(text) > 32 or "'" in text:
        return jsonify([])
    from worker import search_en
    uuid = session[UUID]
    return jsonify(search_en(text, uuid))


# 模糊搜索
@app.route('/app/v1/search/zh/<text>')
def _search_zh(text):
    if len(text) > 32 or "'" in text:
        return jsonify([])
    from worker import search_zh
    uuid = session[UUID]
    return jsonify(search_zh(text, uuid))


# 编辑释义
@app.route('/app/v1/define/<word>', methods=['POST'])
def _define(word):
    try:
        from worker import define
        data = request.get_json()
        flag = session[FLAG]
        if flag == 0:
            return jsonify(define(word, data, ''))
        uuid = session[UUID]
        return jsonify(define(word, data, uuid))
    except:
        return jsonify(-1)


# 编辑释义
@app.route('/app/v1/define/own/<word>', methods=['POST'])
def _defown(word):
    if session[FLAG] == 0:
        return jsonify(-2)
    try:
        from worker import define
        data = request.get_json()
        uuid = session[UUID]
        return jsonify(define(word, data, uuid))
    except:
        return jsonify(-1)


# 编辑释义
@app.route('/app/v1/define/all/<word>', methods=['POST'])
def _defall(word):
    try:
        from worker import define
        data = request.get_json()
        return jsonify(define(word, data, ''))
    except:
        return jsonify(-1)


@app.route('/app/v1/check', methods=['POST'])
def _check():
    '''
    -2: 邮箱格式不对
    -1: 网络错误重试
     0: 邮箱地址不对
     1: 已注册
     2: 未注册
    '''
    from rankey import rankey
    from worker import signup
    from sender import sendin
    from sender import sendat
    from worker import password_of
    from matchr import email
    try:
        data = request.get_json()
        username = data['username'].lower()
        if not email(username):
            return jsonify(-1)
        password = password_of(username)
        if password:
            sendat(password, username)
            return jsonify(1)
        password = rankey(9)
        sendin(password, username)
        signup(username, password)
        return jsonify(0)
    except:
        return jsonify(-2)


@app.route('/app/v1/check/in', methods=['POST'])
def _check_in():
    '''
    -2: 用户名或密码格式错误
     0: 用户名或密码错误
    -1: 提交数据错误
     1: 登录成功
    '''
    from worker import signin
    from matchr import email
    from matchr import passd
    try:
        data = request.get_json()
        name = data['username'].lower()
        if not email(name):
            return jsonify(-2)
        word = data['password']
        if not passd(word):
            return jsonify(-2)
        uuid = signin(name, word, session[UUID])
        if not uuid:
            return jsonify(0)
        session[UUID] = uuid
        session[FLAG] = 1
        return jsonify(1)
    except:
        return jsonify(-1)


@app.route('/app/v1/logout')
def _logout():
    reset_session()
    return jsonify(1)


# 未完全实现
@app.route('/reset/password/<code>')
def _reset_password(code):
    from worker import passwd
    from rankey import rankey
    from sender import sendre
    from signer import loads
    try:
        username, expired = loads(code)
        if not expired:
            password = rankey(9)
            passwd(username, password)
            sendre(password, username)
            reset_session()
            return render(
                'reset_password.html',
                title='重设密码成功'
            )
        return render(
            'reset_password.html',
            title='重设密码过期'
        )
    except:
        return render(
            'reset_password.html',
            title='重设密码失败'
        )


@app.route('/app/v1/addnote', methods=['POST'])
def _addnote():
    from worker import addnote
    try:
        data = request.get_json()
        note = data['note'].strip()
        if note:
            furl = data['furl']
            uuid = session[UUID]
            addnote(uuid, note, furl)
        return jsonify(1)
    except:
        return jsonify(-1)


@app.route('/app/v1/getnote/<int:page>/<int:size>/<order>')
def _getnote(page, size, order):
    offset = (page-1)*size
    if offset >= 1000:
        return jsonify(total=0, data=[])
    if any(x not in ('furl', 'time', 'note') for x in order.split('-')):
        return jsonify(total=0, data=[])
    from worker import getnote
    order = order.replace('-', ', ')
    note = request.args.get('note')
    furl = request.args.get('furl')
    uuid = session[UUID]
    limit = size
    return jsonify(getnote(
        uuid,
        note,
        furl,
        order,
        limit,
        offset
    ))


@app.route('/app/v1/history/<int:page>/<int:size>/<int:flag>/<int:other>/<operator>/<order>')
def _history(page, size, flag, other, operator, order):
    word = request.args.get('word')
    offset = (page-1)*size
    if offset >= (100 if word else 1000):
        return jsonify(total=0, data=[])
    if operator not in ('and', 'or'):
        return jsonify(total=0, data=[])
    if any(x not in ('word', 'time_DESC', 'freq_DESC') for x in order.split('-')):
        return jsonify(total=0, data=[])
    from worker import history
    order = order.replace('-', ', ').replace('_', ' ')
    uuid = session[UUID]
    limit = size
    return jsonify(history(
        uuid,
        word,
        flag,
        operator,
        other,
        order,
        limit,
        offset
    ))


@app.route('/app/v1/reflag/<word>/<int:flag>')
def _reflag(word, flag):
    from worker import reflag
    uuid = session[UUID]
    return jsonify(reflag(uuid, word, flag))


@app.route('/app/v1/reinfo/<word>/<info>')
def _reinfo(word, info):
    from worker import reinfo
    uuid = session[UUID]
    return jsonify(reinfo(uuid, word, info))


@app.route('/app/v1/deflag/<word>')
def _deflag(word):
    from worker import deflag
    uuid = session[UUID]
    return jsonify(deflag(uuid, word))


@app.route('/app/v1/status/<int:time>')
def _status(time):
    if time < 1543622400:  # 2018-12-01 00:00+08
        return jsonify({})
    flag = session[FLAG]
    if flag < 0:  # permission denied
        return jsonify({})
    from worker import status
    return jsonify(status(time))


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
