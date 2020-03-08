import React from 'react';
import { Formik, Form, Field } from 'formik';

import styles from './AnnotationFeedback.module.css';
import Button from '../../elements/Button';
import LoadingIndicator from '../../elements/LoadingIndicator';
import { annotatorsService } from '../../../annotators/annotators.service';
import { judgementsService } from '../../../judgements/judgements.service';
import { FeedbackScore } from '../../../typings/enums';
import { SubmitFeedback } from '../../../typings/fira-be-typings';

const AnnotationFeedback: React.FC = () => {
  async function submitFeedback(feedback: SubmitFeedback) {
    await annotatorsService.submitFeedback(feedback);
    await judgementsService.preloadJudgements();
  }

  return (
    <div className={styles.container}>
      <span className={styles.headline}>Feedback</span>
      <Formik
        initialValues={{
          feedbackScore: FeedbackScore.VERY_GOOD,
          feedbackText: '',
          submissionError: '',
        }}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            await submitFeedback({ score: values.feedbackScore, text: values.feedbackText });
            // omit setSubmitting here because if submission was successful, it will redirect and thus unmount the component
          } catch (e) {
            if (
              (typeof e.message === 'string' && /Network Error/i.test(e.message)) ||
              e.code === 'ECONNABORTED'
            ) {
              setErrors({ submissionError: `Network error. Please make sure to be online.` });
            } else {
              setErrors({
                submissionError: `Unexpected error occured during submission of feedback.`,
              });
            }
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, errors }) => (
          <Form>
            <Field as="textarea" label="Feedback" name="feedbackText" autoComplete="off" />
            <Field name="feedbackScore" as="select">
              {Object.values(FeedbackScore).map(feedbackScore => (
                <option key={feedbackScore} value={feedbackScore}>
                  {feedbackScore}
                </option>
              ))}
            </Field>
            {errors.submissionError && errors.submissionError.length > 0 && (
              <ul className={styles.errorList}>
                <li>
                  <span>{errors.submissionError}</span>
                </li>
              </ul>
            )}
            <Button buttonType="primary" type="submit" disabled={isSubmitting}>
              {!isSubmitting ? 'Continue' : <LoadingIndicator />}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AnnotationFeedback;
