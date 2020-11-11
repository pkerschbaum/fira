import React from 'react';

import styles from './LoadingIndicator.module.css';

const LoadingIndicator: React.FC<{ type?: 'primary' | 'secondary'; className?: string }> = ({
  type = 'secondary',
  className,
}) => (
  <div
    className={`${className} ${styles.ldsEllipsis} ${
      type === 'primary' ? styles.typePrimary : styles.typeSecondary
    }`}
  >
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
);

export default LoadingIndicator;
