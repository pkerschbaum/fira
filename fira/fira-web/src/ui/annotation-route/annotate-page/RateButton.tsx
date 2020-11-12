import React from 'react';

import Button from '../../elements/Button';
import TextBox from '../../elements/TextBox';
import Stack from '../../layouts/Stack';
import { RateLevelType } from '../../../typings/enums';
import { judgementsSchema } from '../../../../../fira-commons';

import { styles } from './RateButton.styles';
import { commonStyles } from '../../Common.styles';

const RATE_LEVEL_DATA = {
  [judgementsSchema.RelevanceLevel.NOT_RELEVANT]: {
    style: styles.rateLevelStyles.notRelevant,
    text: 'Wrong',
  },
  [judgementsSchema.RelevanceLevel.MISLEADING_ANSWER]: {
    style: styles.rateLevelStyles.misleadingAnswer,
    text: 'Misleading',
  },
  [judgementsSchema.RelevanceLevel.TOPIC_RELEVANT_DOES_NOT_ANSWER]: {
    style: styles.rateLevelStyles.topicRelevantDoesNotAnswer,
    text: 'Topic',
  },
  [judgementsSchema.RelevanceLevel.GOOD_ANSWER]: {
    style: styles.rateLevelStyles.goodAnswer,
    text: 'Partial',
  },
  [judgementsSchema.RelevanceLevel.PERFECT_ANSWER]: {
    style: styles.rateLevelStyles.perfectAnswer,
    text: 'Perfect',
  },
} as const;

const RateButton: React.FC<{ rateLevel: RateLevelType; onClick: () => void }> = ({
  rateLevel,
  onClick,
}) => {
  return (
    <Stack direction="row" disableContainerStretch css={styles.container}>
      <Button
        css={[styles.button, RATE_LEVEL_DATA[rateLevel.relevanceLevel].style]}
        onClick={onClick}
      >
        <TextBox fontSize="sm" css={styles.hotkey}>
          {rateLevel.keyboardKey.toShow}
        </TextBox>
        <TextBox fontSize="sm" component="span" css={commonStyles.text.noTransform}>
          {RATE_LEVEL_DATA[rateLevel.relevanceLevel].text}
        </TextBox>
      </Button>
    </Stack>
  );
};

export default RateButton;
