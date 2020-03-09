import React from 'react';

import styles from './AnnotationFeedback.module.css';
import Form from '../../elements/forms/Form';
import { annotatorStories } from '../../../stories/annotator.stories';
import { judgementStories } from '../../../stories/judgement.stories';
import { FeedbackScore } from '../../../typings/enums';
import { SubmitFeedback } from '../../../typings/fira-be-typings';

const AnnotationFeedback: React.FC = () => {
  async function submitFeedback(feedback: SubmitFeedback) {
    await annotatorStories.submitFeedback(feedback);
    await judgementStories.preloadJudgements();
  }

  return (
    <div className={styles.container}>
      <span className={styles.headline}>Feedback</span>
      <Form
        initialValues={{
          feedbackScore: FeedbackScore.VERY_GOOD,
          feedbackText: '',
        }}
        onSubmit={async values => {
          await submitFeedback({ score: values.feedbackScore, text: values.feedbackText });
          // omit setSubmitting here because if submission was successful, it will redirect and thus unmount the component
        }}
        elements={[
          {
            elementType: 'select',
            label: 'Feedback Score',
            childElements: Object.values(FeedbackScore).map(feedbackScore => (
              <option key={feedbackScore} value={feedbackScore}>
                {feedbackScore}
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
