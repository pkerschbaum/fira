import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';

import styles from './Admin.module.css';
import { Statistic } from '../../typings/fira-be-typings';
import { JudgementMode } from '../../typings/enums';
import { adminStories } from '../../stories/admin.stories';
import Button from '../elements/Button';
import Menu from '../elements/Menu';
import Line from '../elements/Line';

const Admin: React.FC = () => {
  const [statistics, updateStatistics] = useState<Statistic[] | undefined>(undefined);

  useEffect(() => {
    async function fetchStatisticsAndUpdate() {
      updateStatistics((await adminStories.getStatistics()).statistics);
    }

    fetchStatisticsAndUpdate();
  }, [updateStatistics]);

  return (
    <div className={styles.container}>
      <div className={styles.adminArea}>
        <div className={styles.actionBar}>
          <Button
            className={styles.button}
            buttonType="secondary"
            onClick={adminStories.exportJudgements}
          >
            <span>Export Judgements</span>
          </Button>
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
                    {Object.values(JudgementMode).map(judgementMode => (
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
                buttonType="secondary"
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
            statistics.map(statistic => (
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
