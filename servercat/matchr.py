from re import match


def email(string):
    return match(r'^[-._a-z0-9]+@(?:[-a-z0-9]+\.)+[a-z]+$', string)


def phone(string):
    return match(r'^1([3578]\d|4[579]|66|9[89])\d{8}$', string)


def passd(string):
    return match(r'^[-_a-zA-Z0-9]{12}$', string)
