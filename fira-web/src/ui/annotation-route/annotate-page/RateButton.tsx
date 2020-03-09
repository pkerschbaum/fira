import React from 'react';

import styles from './RateButton.module.css';
import Button from '../../elements/Button';
import { RateLevelType } from '../../../typings/enums';

const RateButton: React.FC<{ rateLevel: RateLevelType; onClick: () => void }> = ({
  rateLevel,
  onClick,
}) => {
  return (
    <div className={styles.container}>
      <Button
        style={{
          background: rateLevel.buttonColor,
        }}
        className={styles.button}
        onClick={onClick}
      >
        {rateLevel.text}
      </Button>
    </div>
  );
};

export default RateButton;
