import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Card,
  CardActionArea,
  IconButton,
  Skeleton,
  Theme,
} from '@material-ui/core';
import { useQuery } from 'react-query';

import CancelIcon from '@material-ui/icons/Cancel';
import EditIcon from '@material-ui/icons/Edit';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

import TextBox from '../../elements/TextBox';
import Stack from '../../layouts/Stack';
import { RateBadge } from '../annotate-page/RateButton';
import { useRouting } from '../AnnotationRouter';
import { judgementStories } from '../../../stories/judgement.stories';

import { styles } from './AnnotationHistory.styles';
import { commonStyles } from '../../Common.styles';

type HistoryDataEntry = {
  judgementNr: number;
  judgementId: number;
};

const pageSize = 5;

const AnnotationHistory: React.FC = () => {
  const { routeToAnnotatePage } = useRouting();
  const [currentPage, setCurrentPage] = useState(0);

  const skip = currentPage * pageSize;
  const query = useQuery(
    ['judgements-of-user', skip],
    () => judgementStories.loadJudgementsOfUser(skip, pageSize),
    { retry: false },
  );

  function handleCloseHistory() {
    routeToAnnotatePage();
  }

  function handlePagingBack() {
    setCurrentPage((oldVal) => oldVal + 1);
  }

  function handlePagingForward() {
    setCurrentPage((oldVal) => oldVal - 1);
  }

  return (
    <Stack alignItems="stretch" css={commonStyles.fullHeight}>
      <Stack direction="row" disableContainerStretch justifyContent="space-between">
        <Box />
        <IconButton style={{ padding: 4 }} onClick={handleCloseHistory}>
          <CancelIcon />
        </IconButton>
      </Stack>
      <Stack alignItems="stretch" css={commonStyles.flex.shrinkAndFit}>
        {query.isError ? (
          <Alert severity="error">
            <AlertTitle>Error occured</AlertTitle>
            {query.error}
          </Alert>
        ) : query.isLoading || query.data === undefined ? (
          <Skeleton
            variant="rectangular"
            animation="wave"
            css={[styles.listSkeleton, commonStyles.fullWidth, commonStyles.fullHeight]}
          />
        ) : (
          query.data.data.map((entry) => (
            <HistoryEntry key={entry.nr} judgementId={entry.id} judgementNr={entry.nr} />
          ))
        )}
      </Stack>
      <Stack direction="row" disableContainerStretch justifyContent="space-between">
        <IconButton
          style={{ padding: 4 }}
          disabled={!!query.data?.data.find((elem) => elem.nr === 1)}
          onClick={handlePagingBack}
        >
          <NavigateBeforeIcon style={{ height: 32, width: 32 }} />
        </IconButton>
        <IconButton
          style={{ padding: 4 }}
          disabled={currentPage === 0}
          onClick={handlePagingForward}
        >
          <NavigateNextIcon style={{ height: 32, width: 32 }} />
        </IconButton>
      </Stack>
    </Stack>
  );
};

const HistoryEntry: React.FC<HistoryDataEntry> = ({ judgementNr, judgementId }) => {
  const query = useQuery(
    ['judgement', judgementId],
    () => judgementStories.loadJudgementById(judgementId),
    { retry: false },
  );

  function handleEntryClick() {
    // TODO implement
    console.log(judgementId);
  }

  return (
    <Card onClick={handleEntryClick}>
      <CardActionArea>
        <Box sx={{ padding: (theme: Theme) => theme.spacing() }}>
          {query.isError ? (
            <Alert severity="error">
              <AlertTitle>Error occured</AlertTitle>
              {query.error}
            </Alert>
          ) : (
            <Stack alignItems="stretch" spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Stack direction="row" alignItems="stretch" css={commonStyles.flex.shrinkAndFit}>
                  <TextBox bold>#{judgementNr}</TextBox>
                  <TextBox
                    bold
                    css={[commonStyles.flex.shrinkAndFit, commonStyles.text.overflowEllipsis]}
                  >
                    {query.isLoading || query.data === undefined ? (
                      <Skeleton
                        variant="rectangular"
                        animation="wave"
                        css={[commonStyles.fullWidth, commonStyles.fullHeight]}
                      />
                    ) : (
                      query.data.queryText
                    )}
                  </TextBox>
                </Stack>
                <EditIcon />
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <TextBox
                  textAlign="start"
                  css={[commonStyles.text.overflowEllipsis, commonStyles.flex.shrinkAndFit]}
                >
                  {query.isLoading || query.data === undefined ? (
                    <Stack direction="row" alignItems="stretch">
                      <Skeleton
                        variant="rectangular"
                        animation="wave"
                        css={[commonStyles.fullWidth]}
                      />
                    </Stack>
                  ) : (
                    query.data.documentText
                  )}
                </TextBox>
                <Box>
                  <RateBadge
                    relevanceLevel={
                      query.isLoading || query.data === undefined
                        ? 'LOADING'
                        : query.data.relevanceLevel
                    }
                    css={styles.rateBadge}
                  />
                </Box>
              </Stack>
            </Stack>
          )}
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default AnnotationHistory;
