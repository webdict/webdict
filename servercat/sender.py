from smtplib import SMTPRecipientsRefused
from email.mime.text import MIMEText
from smtplib import SMTP_SSL as SMTP
from secret import email_password
from email.header import Header
from signer import dumps
from threading import Thread


class MailThread(Thread):
    def __init__(self, html, to):
        Thread.__init__(self)
        self.html = html
        self.to = to

    def send(self, retry=3):
        try:
            with SMTP('smtp.163.com') as smtp:
                message = MIMEText(self.html, 'html', 'utf-8')
                message['Subject'] = Header('网词快查·登录密码', 'utf-8')
                message['From'] = 'webdict@163.com'
                message['To'] = self.to
                smtp.login('webdict', email_password)
                smtp.sendmail(
                    'webdict@163.com',
                    [self.to],
                    message.as_string()
                )
                return 1
        except SMTPRecipientsRefused as e:
            return 0
        except Exception as e:
            if retry == 1:
                raise e
            return self.send(retry-1)

    def run(self):
        try:
            self.send(retry=6)
        except:
            pass


def sendin(password, to):
    MailThread((
        f'<p><b>尊敬的用户，您好！</b></p>'
        f'<br/>'
        f'<p>您正在注册网词快查，登录密码为：</p>'
        f'<p><span style="user-select: none">» </span><a style="text-decoration: none">{password}</a></p>'
    ), to).start()


def sendat(password, to):
    href = f'https://dict.ngolin.com/reset/password/{dumps(to)}'
    MailThread((
        f'<p><b>尊敬的用户，您好！</b></p>'
        f'<br/>'
        f'<p>您正在登录网词快查，登录密码为：</p>'
        f'<p><span style="user-select: none">» </span><a style="text-decoration: none">{password}</a></p>'
        f'<br/>'
        f'<br/>'
        f'<p>如非您本人操作，请尽快重设密码：</p>'
        f'<p>» <a href="{href}">{href}</a></p>'
    ), to).start()


def sendre(password, to):
    return MailThread((
        f'<p><b>尊敬的用户，您好！</b></p>'
        f'<br/>'
        f'<p>您正在重设登录密码，新密码为：</p>'
        f'<p><span style="user-select: none">» </span><a style="text-decoration: none">{password}</a></p>'
    ), to).start()
