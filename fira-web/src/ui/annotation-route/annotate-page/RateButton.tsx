import React from 'react';

import styles from './RateButton.module.css';
import Button from '../../elements/Button';
import { RateLevelType, RelevanceLevel } from '../../../typings/enums';

const RATE_LEVEL_STYLES = {
  [RelevanceLevel.MISLEADING_ANSWER]: styles.misleadingAnswer,
  [RelevanceLevel.NOT_RELEVANT]: styles.notRelevant,
  [RelevanceLevel.TOPIC_RELEVANT_DOES_NOT_ANSWER]: styles.topicRelevantDoesNotAnswer,
  [RelevanceLevel.GOOD_ANSWER]: styles.goodAnswer,
  [RelevanceLevel.PERFECT_ANSWER]: styles.perfectAnswer,
} as const;

const RateButton: React.FC<{ rateLevel: RateLevelType; onClick: () => void }> = ({
  rateLevel,
  onClick,
}) => {
  return (
    <div className={styles.container}>
      <Button
        className={`${styles.button} ${RATE_LEVEL_STYLES[rateLevel.relevanceLevel]}`}
        onClick={onClick}
      >
        {rateLevel.text}
      </Button>
    </div>
  );
};

export default RateButton;
