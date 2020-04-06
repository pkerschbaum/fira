import React from 'react';

import styles from './RateButton.module.css';
import Button from '../../elements/Button';
import { RateLevelType } from '../../../typings/enums';
import { RelevanceLevel } from '../../../../../commons';

const RATE_LEVEL_DATA = {
  [RelevanceLevel.NOT_RELEVANT]: {
    style: styles.notRelevant,
    text: 'Wrong',
  },
  [RelevanceLevel.MISLEADING_ANSWER]: {
    style: styles.misleadingAnswer,
    text: 'Misleading',
  },
  [RelevanceLevel.TOPIC_RELEVANT_DOES_NOT_ANSWER]: {
    style: styles.topicRelevantDoesNotAnswer,
    text: 'Topic',
  },
  [RelevanceLevel.GOOD_ANSWER]: { style: styles.goodAnswer, text: 'Partial' },
  [RelevanceLevel.PERFECT_ANSWER]: {
    style: styles.perfectAnswer,
    text: 'Perfect',
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
        <div className={styles.hotkey}>{rateLevel.keyboardKey.toShow}</div>
        <span>{RATE_LEVEL_DATA[rateLevel.relevanceLevel].text}</span>
      </Button>
    </div>
  );
};

export default RateButton;
