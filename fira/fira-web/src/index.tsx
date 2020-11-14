import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { StylesProvider } from '@material-ui/core/styles';
import { enUS } from '@material-ui/core/locale';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';

import './index.css';

import App from './App';
import { store } from './state/store';
import { executeBootScripts } from './boot/boot';
import { createTheme } from './theme';
import { ThemeProvider } from './ThemeProvider';
import * as serviceWorker from './serviceWorker';

const queryCache = new QueryCache();

(async function bootstrap() {
  await executeBootScripts();

  const renderApp = () => {
    const theme = createTheme(enUS);

    ReactDOM.render(
      <React.StrictMode>
        <StylesProvider injectFirst>
          <ThemeProvider theme={theme}>
            <Provider store={store}>
              <ReactQueryCacheProvider queryCache={queryCache}>
                <App />
              </ReactQueryCacheProvider>
            </Provider>
          </ThemeProvider>
        </StylesProvider>
      </React.StrictMode>,
      document.getElementById('root'),
    );
  };

  if (process.env.NODE_ENV === 'development' && (module as any).hot) {
    (module as any).hot.accept('./theme', renderApp);
  }

  renderApp();

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
  serviceWorker.unregister();
})();
