import React from 'react';

import styles from './Line.module.css';

const Line: React.FC<{ orientation: 'horizontal' }> = () => (
  <div className={styles.horizontalLine} />
);

export default Line;
