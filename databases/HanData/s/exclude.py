exclude_set = {
    ('份子', '分子'),
    ('分子', '份子'),
    ('嘅', '慨'),
    ('慨', '嘅'),
    ('噘', '撅'),
    ('彷', '仿'),
    ('仿', '彷'),
    ('炤', '照'),
    ('苹', '苹'),
    ('蘋', '𬞟'),
    ('薰', '薰'),
    ('余', '余'),
    ('伙', '伙'),
    ('征', '征'),
}


def exclude(k1, k2):
    return (k1, k2) in exclude_set