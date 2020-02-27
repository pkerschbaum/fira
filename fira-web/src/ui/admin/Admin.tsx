import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';

import styles from './Admin.module.css';
import { Statistic } from '../../typings/fira-be-typings';
import { JudgementMode } from '../../typings/enums';
import { adminService } from '../../admin/admin.service';
import Button from '../elements/Button';
import Menu from '../elements/Menu';
import LoadingIndicator from '../elements/LoadingIndicator';

const Admin: React.FC = () => {
  const [statistics, updateStatistics] = useState<Statistic[] | undefined>(undefined);

  useEffect(() => {
    async function fetchStatisticsAndUpdate() {
      updateStatistics((await adminService.getStatistics()).statistics);
    }

    fetchStatisticsAndUpdate();
  }, [updateStatistics]);

  return (
    <div className={styles.container}>
      <div className={styles.adminArea}>
        <div className={styles.actionBar}>
          <Button
            className={styles.button}
            buttonType="primary"
            onClick={adminService.exportJudgements}
          >
            Export Judgements
          </Button>
          <Menu />
        </div>
        <Formik
          initialValues={{
            judgementMode: JudgementMode.SCORING_AND_SELECT_SPANS,
            rotateDocumentText: 'true',
          }}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await adminService.updateConfig({
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
              <Button
                className={styles.button}
                buttonType="primary"
                type="submit"
                disabled={isSubmitting}
              >
                {!isSubmitting ? 'Update Config' : <LoadingIndicator />}
              </Button>
            </Form>
          )}
        </Formik>
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
