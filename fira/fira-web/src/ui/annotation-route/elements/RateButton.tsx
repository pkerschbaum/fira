import React from 'react';
import { Box, ButtonBase } from '@material-ui/core';

import TextBox from '../../elements/TextBox';
import { judgementsSchema } from '@fira-commons';

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
  LOADING: {
    style: styles.rateLevelStyles.loading,
    text: <>&nbsp;</>,
  },
} as const;

const RateButton: React.FC<{
  relevanceLevel: judgementsSchema.RelevanceLevel;
  keyboardKeyToShow?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}> = (props) => {
  const { onClick, ...otherProps } = props;
  return (
    <ButtonBase onClick={onClick} css={styles.button}>
      <RateBadge {...otherProps} />
    </ButtonBase>
  );
};

export const RateBadge: React.FC<{
  relevanceLevel: judgementsSchema.RelevanceLevel | 'LOADING';
  keyboardKeyToShow?: string;
  active?: boolean;
  className?: string;
}> = ({ relevanceLevel, keyboardKeyToShow, active, className }) => (
  <Box
    css={[styles.badge, RATE_LEVEL_DATA[relevanceLevel].style, active && styles.activeLevel]}
    className={className}
  >
    {keyboardKeyToShow && (
      <TextBox fontSize="sm" css={styles.hotkey}>
        {keyboardKeyToShow}
      </TextBox>
    )}
    <TextBox fontSize="sm" bold={active} component="span" css={commonStyles.text.noTransform}>
      {RATE_LEVEL_DATA[relevanceLevel].text}
    </TextBox>
  </Box>
);

export default RateButton;
