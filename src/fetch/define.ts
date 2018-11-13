import fetch from './_';


export default ({ word, data }) => fetch(`/app/v1/define/${encodeURIComponent(word)}`, data);