import React from 'react';

import styles from './RateButton.module.css';
import Button from '../../elements/Button';
import { RateLevelType, RelevanceLevel } from '../../../typings/enums';

const RATE_LEVEL_DATA = {
  [RelevanceLevel.NOT_RELEVANT]: {
    style: styles.notRelevant,
    text: 'Wrong',
    keyboardKey: '1',
  },
  [RelevanceLevel.MISLEADING_ANSWER]: {
    style: styles.misleadingAnswer,
    text: 'Misleading',
    keyboardKey: '2',
  },
  [RelevanceLevel.TOPIC_RELEVANT_DOES_NOT_ANSWER]: {
    style: styles.topicRelevantDoesNotAnswer,
    text: 'Ok',
    keyboardKey: '3',
  },
  [RelevanceLevel.GOOD_ANSWER]: { style: styles.goodAnswer, text: 'Good', keyboardKey: '4' },
  [RelevanceLevel.PERFECT_ANSWER]: {
    style: styles.perfectAnswer,
    text: 'Perfect',
    keyboardKey: '5',
  },
} as const;

const RateButton: React.FC<{ rateLevel: RateLevelType; onClick: () => void }> = ({
  rateLevel,
  onClick,
}) => {
  return (
    <div className={styles.container}>
      <Button
        className={`${styles.button} ${RATE_LEVEL_DATA[rateLevel.relevanceLevel].style}`}
        onClick={onClick}
      >
        <div className={styles.hotkey}>{RATE_LEVEL_DATA[rateLevel.relevanceLevel].keyboardKey}</div>
        <span>{RATE_LEVEL_DATA[rateLevel.relevanceLevel].text}</span>
      </Button>
    </div>
  );
};

export default RateButton;
