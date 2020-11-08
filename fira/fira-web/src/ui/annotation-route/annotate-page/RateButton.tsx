import React from 'react';

import styles from './RateButton.module.css';
import Button from '../../elements/Button';
import { RateLevelType } from '../../../typings/enums';
import { judgementsSchema } from '../../../../../fira-commons';

const RATE_LEVEL_DATA = {
  [judgementsSchema.RelevanceLevel.NOT_RELEVANT]: {
    style: styles.notRelevant,
    text: 'Wrong',
  },
  [judgementsSchema.RelevanceLevel.MISLEADING_ANSWER]: {
    style: styles.misleadingAnswer,
    text: 'Misleading',
  },
  [judgementsSchema.RelevanceLevel.TOPIC_RELEVANT_DOES_NOT_ANSWER]: {
    style: styles.topicRelevantDoesNotAnswer,
    text: 'Topic',
  },
  [judgementsSchema.RelevanceLevel.GOOD_ANSWER]: { style: styles.goodAnswer, text: 'Partial' },
  [judgementsSchema.RelevanceLevel.PERFECT_ANSWER]: {
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
