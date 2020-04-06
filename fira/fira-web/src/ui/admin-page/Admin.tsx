import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';

import styles from './Admin.module.css';
import { JudgementMode, Statistic } from '../../../../commons';
import { adminStories } from '../../stories/admin.stories';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import Button from '../elements/Button';
import Menu from '../elements/Menu';
import Line from '../elements/Line';

const Admin: React.FC = () => {
  const [statistics, updateStatistics] = useState<Statistic[] | undefined>(undefined);

  // TODO improve: if the application starts, and a user is logged in but the access token is expired,
  // user.subscriptions.ts will asynchronously refresh the token. But the effect fires immediately,
  // so the fetch of statistics fails. That's why we add the user as a dependency for the effect.
  // it would be better if the application waits for the successful refresh and only runs the effect afterwards.
  const user = useSelector((state: RootState) => state.user);
  useEffect(() => {
    async function fetchStatisticsAndUpdate() {
      updateStatistics((await adminStories.getStatistics()).statistics);
    }

    fetchStatisticsAndUpdate();
  }, [user]);

  return (
    <div className={styles.container}>
      <div className={styles.adminArea}>
        <div className={styles.actionBar}>
          <div className={styles.actionButtons}>
            <Button className={styles.button} onClick={adminStories.exportJudgements}>
              <span>Export Judgements</span>
            </Button>
            <Button className={styles.button} onClick={adminStories.exportFeedback}>
              <span>Export Feedback</span>
            </Button>
          </div>
          <Menu />
        </div>
        <Line orientation="horizontal" />
        <Formik
          initialValues={{
            judgementMode: JudgementMode.SCORING_AND_SELECT_SPANS,
            rotateDocumentText: 'true',
          }}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await adminStories.updateConfig({
                ...values,
                rotateDocumentText: values.rotateDocumentText === 'true',
              });
              setSubmitting(true);
            } catch (e) {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className={styles.actionBar}>
              <div className={styles.options}>
                <div>
                  <label htmlFor="judgementMode">Judgement Mode:</label>
                  <Field name="judgementMode" as="select">
                    {Object.values(JudgementMode).map((judgementMode) => (
                      <option key={judgementMode} value={judgementMode}>
                        {judgementMode}
                      </option>
                    ))}
                  </Field>
                </div>
                <div>
                  <label htmlFor="rotateDocumentText">Rotate Document Text:</label>
                  <Field name="rotateDocumentText" as="select">
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </Field>
                </div>
              </div>
              <Button
                className={styles.button}
                type="submit"
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Update Config
              </Button>
            </Form>
          )}
        </Formik>
        <Line orientation="horizontal" />
        <div className={styles.statisticsContainer}>
          {statistics &&
            statistics.map((statistic) => (
              <div key={statistic.id} className={styles.statistic}>
                <div className={styles.statisticValue}>{statistic.value}</div>
                <div className={styles.statisticLabel}>{statistic.label}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
