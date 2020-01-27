import React from 'react';

import styles from './LoadingIndicator.module.css';

const LoadingIndicator: React.FC = () => (
  <div className={styles.ldsEllipsis}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
);

export default LoadingIndicator;
