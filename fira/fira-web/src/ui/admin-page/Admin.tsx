import React, { useState, useEffect } from 'react';
import { Box, Divider } from '@material-ui/core';
import { Formik, Form } from 'formik';
import { useSelector } from 'react-redux';

import Button from '../elements/Button';
import TextBox from '../elements/TextBox';
import Menu from '../elements/Menu';
import SelectInput from '../elements/forms/SelectInput';
import SwitchInput from '../elements/forms/SwitchInput';
import Stack from '../layouts/Stack';
import { adminStories } from '../../stories/admin.stories';
import { RootState } from '../../state/store';
import { adminSchema, judgementsSchema } from '@fira-commons';

import { styles } from './Admin.styles';
import { commonStyles } from '../Common.styles';

const Admin: React.FC = () => {
  const [statistics, updateStatistics] = useState<adminSchema.Statistic[] | undefined>(undefined);

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
    <Stack
      justifyContent="center"
      alignItems="stretch"
      spacing={2}
      css={[commonStyles.fullHeight, styles.adminArea]}
    >
      <Stack direction="row" disableContainerStretch justifyContent="space-between">
        <Stack direction="row">
          <Button variant="outlined" onClick={adminStories.exportJudgements}>
            Export Judgements
          </Button>
          <Button variant="outlined" onClick={adminStories.exportFeedback}>
            Export Feedback
          </Button>
        </Stack>
        <Menu />
      </Stack>

      <Divider />

      <Formik
        initialValues={{
          judgementMode: judgementsSchema.JudgementMode.SCORING_AND_SELECT_SPANS,
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
          <Form>
            <Stack direction="row" justifyContent="space-between">
              <Stack alignItems="stretch" css={commonStyles.flex.shrinkAndFitHorizontal}>
                <SelectInput
                  name="judgementMode"
                  label="Judgement Mode"
                  availableValues={Object.values(
                    judgementsSchema.JudgementMode,
                  ).map((judgementMode) => ({ label: judgementMode, value: judgementMode }))}
                />
                <SwitchInput name="rotateDocumentText" label="Rotate Document Text" />
              </Stack>
              <Button
                variant="outlined"
                type="submit"
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Update Config
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>

      <Divider />

      {statistics && (
        <Box css={styles.statisticsArea}>
          {statistics.map((statistic) => (
            <Stack key={statistic.id} justifyContent="center">
              <TextBox fontSize="xl">{statistic.value}</TextBox>
              <TextBox textAlign="center">{statistic.label}</TextBox>
            </Stack>
          ))}
        </Box>
      )}
    </Stack>
  );
};

export default Admin;
