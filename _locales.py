data = {
    'FIRST_WORD': {
        'en': 'First',
        'zh': '第一词',
        'zh_TW': '第一词',
        'zh_HK': '第一词',
        'zh_MO': '第一词'
    },
    'NEXT_WORD': {
        'en': 'Next',
        'zh': '下一词',
        'zh_TW': '下一词',
        'zh_HK': '下一词',
        'zh_MO': '下一词'
    },
}


def main():
    from json import dump
    locales = {locale for head in data for locale in data[head]}
    locales.discard('description')
    localed = {}
    for locale in locales:
        content = {}
        for head in data:
            content[head] = {'message': data[head][locale]}
            if 'description' in data[head]:
                content[head]['description'] = data[head]['description']
        localed[locale] = content
    for locale in localed:
        path = 'src/copy/_locales/'+locale
        with open(path+'/messages.json', mode='w', encoding='utf-8') as f:
            dump(localed[locale], f, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    main()
