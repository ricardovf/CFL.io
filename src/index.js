import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
// import registerServiceWorker from './registerServiceWorker';
import { store } from './store';

import { getPersistor } from '@rematch/persist';
import { PersistGate } from 'redux-persist/es/integration/react';

const persistor = getPersistor();

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);
// registerServiceWorker();
