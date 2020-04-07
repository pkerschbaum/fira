import React from 'react';

import styles from './Dialog.module.css';
import Button from './Button';

type DialogProps = { children: React.ReactNode; onClose: () => void };

const Dialog: React.FC<DialogProps> = ({ children, onClose }) => {
  return (
    <div className={styles.container}>
      <div className={styles.dialog}>
        <div>{children}</div>
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default Dialog;
