import React from 'react';

import styles from './App.module.css';
import MainRouter from './ui/MainRouter';

const App: React.FC = () => (
  <div className={styles.app}>
    <MainRouter />
  </div>
);

export default App;
