import React from 'react';
import { Box } from '@material-ui/core';

import TextBox from '../../elements/TextBox';
import Form from '../../elements/forms/Form';
import Stack from '../../layouts/Stack';
import { annotatorStories } from '../../../stories/annotator.stories';
import { judgementStories } from '../../../stories/judgement.stories';
import { feedbackSchema } from '../../../../../fira-commons';

import { styles } from './AnnotationFeedback.styles';

const FEEDBACK_SCORE_TEXTS = {
  [feedbackSchema.FeedbackScore.VERY_GOOD]: 'Very good',
  [feedbackSchema.FeedbackScore.GOOD]: 'Good',
  [feedbackSchema.FeedbackScore.DECENT]: 'Decent',
  [feedbackSchema.FeedbackScore.DONT_LIKE_IT]: `Don't like it`,
} as const;

const AnnotationFeedback: React.FC = () => {
  async function submitFeedback(feedback: feedbackSchema.SubmitFeedback) {
    await annotatorStories.submitFeedback(feedback);
    await judgementStories.preloadJudgements();
  }

  return (
    <Stack css={styles.container}>
      <TextBox fontSize="lg" bold textAlign="center">
        Feedback
      </TextBox>
      <Stack spacing={2}>
        <Box>
          How did you like to work with Fira so far?
          <br />
          We kindly ask you to take a minute to provide some feedback!
        </Box>
        <Form
          initialValues={{
            feedbackScore: feedbackSchema.FeedbackScore.VERY_GOOD,
            feedbackText: '',
          }}
          onSubmit={async (values) => {
            await submitFeedback({ score: values.feedbackScore, text: values.feedbackText });
            // omit setSubmitting here because if submission was successful, it will redirect and thus unmount the component
          }}
          elements={[
            {
              elementType: 'select',
              label: 'Rating',
              availableValues: Object.values(feedbackSchema.FeedbackScore).map((feedbackScore) => ({
                value: feedbackScore,
                label: FEEDBACK_SCORE_TEXTS[feedbackScore],
              })),
              name: 'feedbackScore',
            },
            {
              elementType: 'textarea',
              htmlProps: {
                placeholder: 'Do you want to add something?',
                name: 'feedbackText',
                autoComplete: 'off',
              },
            },
          ]}
        />
      </Stack>
    </Stack>
  );
};

export default AnnotationFeedback;
