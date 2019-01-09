from smtplib import SMTPRecipientsRefused
from email.mime.text import MIMEText
from smtplib import SMTP_SSL as SMTP
from secret import email_password
from email.header import Header


def semail(href, to, retry=3):
    try:
        with SMTP('smtp.163.com') as smtp:
            message = MIMEText((
                f'<p><b>尊敬的用户，您好！</b></p>'
                f'<br/>'
                f'<p>您正在注册网词快查，<a href="{href}">请完成验证！</a></p>'
                f'<p>» <a href="{href}">{href}</a></p>'
            ), 'html', 'utf-8')
            message['Subject'] = Header('网词快查·邮箱验证', 'utf-8')
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
        return semail(href, to, retry-1)
