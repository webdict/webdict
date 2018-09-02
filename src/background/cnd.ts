chrome.webRequest.onBeforeRequest.addListener(({ url }) => {
    url = url.replace('googleapis.com', 'lug.ustc.edu.cn');
    url = url.replace('themes.googleusercontent.com', 'google-themes.lug.ustc.edu.cn');
    return { redirectUrl: url };
}, {
        urls: [
            "*://ajax.googleapis.com/*",
            "*://themes.googleusercontent.com/*"
        ]
    }, ["blocking"]);