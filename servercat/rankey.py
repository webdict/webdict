from base64 import urlsafe_b64encode as _b
from os import urandom as _u


def rankey():
    return _b(_u(18)).decode()
