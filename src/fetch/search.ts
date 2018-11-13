import { WordData } from '../shared/typings';
import fetch from './_';


export default ({ text, lang }): Promise<WordData[]> =>
  fetch(`/app/v1/search/${lang}/${encodeURIComponent(text)}`);


