import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import './index.css';
import App from './ui/App';
import { store } from './store/store';
import * as serviceWorker from './serviceWorker';
import { executeBootScripts } from './boot/boot';

executeBootScripts();

const renderApp = () =>
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root'),
  );

if (process.env.NODE_ENV !== 'production' && (module as any).hot) {
  (module as any).hot.accept('./ui/App', renderApp);
}

renderApp();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
