import './sass/theme.scss';
import createApp from './components/App';
import inject from './popdict';
// import { Action } from '../shared/typings';

createApp(null);


inject((action) => {
  console.log(action.action);
});

