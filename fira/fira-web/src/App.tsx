import React from 'react';

import MainRouter from './ui/MainRouter';

import styles from './App.module.css';

const App: React.FC = () => (
  <div className={styles.app}>
    <MainRouter />
  </div>
);

export default App;
