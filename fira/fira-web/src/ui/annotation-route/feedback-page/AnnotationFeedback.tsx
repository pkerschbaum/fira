import React from 'react';

import styles from './AnnotationFeedback.module.css';
import Form from '../../elements/forms/Form';
import { annotatorStories } from '../../../stories/annotator.stories';
import { judgementStories } from '../../../stories/judgement.stories';
import { FeedbackScore, SubmitFeedback } from '../../../../../fira-commons';

const FEEDBACK_SCORE_TEXTS = {
  [FeedbackScore.VERY_GOOD]: 'Very good',
  [FeedbackScore.GOOD]: 'Good',
  [FeedbackScore.DECENT]: 'Decent',
  [FeedbackScore.DONT_LIKE_IT]: `Don't like it`,
} as const;

const AnnotationFeedback: React.FC = () => {
  async function submitFeedback(feedback: SubmitFeedback) {
    await annotatorStories.submitFeedback(feedback);
    await judgementStories.preloadJudgements();
  }

  return (
    <div className={styles.container}>
      <span className={styles.headline}>Feedback</span>
      <div>
        How did you like to work with Fira so far?
        <br />
        We kindly ask you to take a minute to provide some feedback!
      </div>
      <Form
        initialValues={{
          feedbackScore: FeedbackScore.VERY_GOOD,
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
            childElements: Object.values(FeedbackScore).map((feedbackScore) => (
              <option key={feedbackScore} value={feedbackScore}>
                {FEEDBACK_SCORE_TEXTS[feedbackScore]}
              </option>
            )),
            htmlProps: { name: 'feedbackScore' },
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
    </div>
  );
};

export default AnnotationFeedback;
