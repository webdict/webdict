from itsdangerous import URLSafeTimedSerializer
from itsdangerous import SignatureExpired
from itsdangerous import BadSignature
from secret import email_password
from secret import appkey

serializer = URLSafeTimedSerializer(
    email_password,
    appkey
)


def dumps(data, salt=None):
    return serializer.dumps(
        data,
        salt=salt
    )


def loads(code, salt=None):
    try:
        return serializer.loads(
            code,
            max_age=7,
            # max_age=7*24*3600,
            salt=salt
        ), False
    except SignatureExpired:
        return serializer.loads(code, salt=salt, return_timestamp=True)
