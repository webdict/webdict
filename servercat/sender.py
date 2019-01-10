from smtplib import SMTPRecipientsRefused
from email.mime.text import MIMEText
from smtplib import SMTP_SSL as SMTP
from secret import email_password
from email.header import Header
from signer import dumps


def _send(html, to, retry=3):
    try:
        with SMTP('smtp.163.com') as smtp:
            message = MIMEText(html, 'html', 'utf-8')
            message['Subject'] = Header('网词快查·登录密码', 'utf-8')
            message['From'] = 'webdict@163.com'
            message['To'] = to
            smtp.login('webdict', email_password)
            smtp.sendmail('webdict@163.com', [to], message.as_string())
            return 1
    except SMTPRecipientsRefused as e:
        return 0
    except Exception as e:
        if retry == 1:
            raise e
        return _send(html, to, retry-1)


def sendin(password, to):
    return _send((
        f'<p><b>尊敬的用户，您好！</b></p>'
        f'<br/>'
        f'<p>您正在注册网词快查，登录密码为：</p>'
        f'<p>» <a href="#">{password}</a></p>'
    ), to)


def sendre(password, to):
    return _send((
        f'<p><b>尊敬的用户，您好！</b></p>'
        f'<br/>'
        f'<p>您正在重设登录密码，新密码为：</p>'
        f'<p>» <a href="#">{password}</a></p>'
    ), to)


def sendat(password, to):
    href = f'http://dict.ngolin.com/reset/password/{dumps(to)}'
    return _send((
        f'<p><b>尊敬的用户，您好！</b></p>'
        f'<br/>'
        f'<p>您正在登录网词快查，登录密码为：</p>'
        f'<p>» <a href="#">{password}</a></p>'
        f'<br/>'
        f'<br/>'
        f'<p>如非您本人操作，请尽快重设密码：</p>'
        f'<p>» <a href="{href}">{href}</a></p>'
    ), to)
