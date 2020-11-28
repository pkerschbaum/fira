import React, { useEffect, useRef, useState } from 'react';
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
import ResizeObserver from 'resize-observer-polyfill';

import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

import TextBox from '../../elements/TextBox';
import Stack from '../../layouts/Stack';
import { RateBadge } from '../elements/RateButton';
import { useRouting } from '../../MainRouter';
import { useQueryJudgement, useQueryJudgements } from '../../../stories/judgement.stories';
import { useKeyupHandler } from '../../util/events.hooks';

import { styles } from './AnnotationHistory.styles';
import { commonStyles } from '../../Common.styles';

type HistoryDataEntry = {
  judgementNr: number;
  judgementId: number;
};

const KEYCODE_LEFT_ARROW = 'ArrowLeft';
const KEYCODE_RIGHT_ARROW = 'ArrowRight';
const HEIGHT_OF_HISTORY_ELEMENT = 100; // px

const AnnotationHistory: React.FC = () => {
  const { route } = useRouting();

  const [skip, setSkip] = useState(0);
  const [pageSize, setPageSize] = useState<undefined | number>(undefined);
  const listContainerRef = useRef<HTMLElement | null>(null);

  useEffect(
    function computePageSizeBasedOnAvailableSpace() {
      if (listContainerRef.current !== null) {
        const ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            setPageSize(Math.floor(entry.contentRect.height / HEIGHT_OF_HISTORY_ELEMENT));
          }
        });
        ro.observe(listContainerRef.current);
        return () => ro.disconnect();
      }
    },
    [listContainerRef],
  );

  const query = useQueryJudgements();

  useKeyupHandler({
    [KEYCODE_LEFT_ARROW]: { handler: handlePagingBack },
    [KEYCODE_RIGHT_ARROW]: { handler: handlePagingForward },
  });

  function handleCloseHistory() {
    route.annotation.toAnnotatePage();
  }

  function handlePagingBack() {
    setSkip((oldVal) => {
      if (pageSize === undefined) {
        return oldVal;
      }

      const newSkip = oldVal + pageSize;
      if (query.data === undefined) {
        return newSkip;
      } else {
        return Math.min(oldVal + pageSize, query.data.judgements.length - 1);
      }
    });
  }

  function handlePagingForward() {
    setSkip((oldVal) => {
      if (pageSize === undefined) {
        return oldVal;
      }

      return Math.max(oldVal - pageSize, 0);
    });
  }

  return (
    <Stack alignItems="stretch" css={commonStyles.fullHeight}>
      <Stack direction="row-reverse" disableContainerStretch justifyContent="space-between">
        <IconButton onClick={handleCloseHistory}>
          <CloseIcon style={{ width: 32, height: 32 }} />
        </IconButton>
      </Stack>
      <Stack
        ref={listContainerRef}
        alignItems="stretch"
        css={commonStyles.flex.shrinkAndFitVertical}
      >
        {query.isError ? (
          <Alert severity="error">
            <AlertTitle>Error occured</AlertTitle>
            {query.error}
          </Alert>
        ) : pageSize === undefined || query.isLoading || query.data === undefined ? (
          <Skeleton
            variant="rectangular"
            animation="wave"
            css={[styles.listSkeleton, commonStyles.fullWidth, commonStyles.fullHeight]}
          />
        ) : (
          query.data.judgements
            .slice(skip, skip + pageSize)
            .map((entry) => (
              <HistoryEntry key={entry.id} judgementId={entry.id} judgementNr={entry.nr} />
            ))
        )}
      </Stack>
      <Stack direction="row" disableContainerStretch justifyContent="space-between">
        <IconButton
          disabled={
            pageSize === undefined ||
            query.data === undefined ||
            skip + pageSize >= query.data.judgements.length
          }
          onClick={handlePagingBack}
        >
          <NavigateBeforeIcon style={{ height: 32, width: 32 }} />
        </IconButton>
        <IconButton disabled={pageSize === undefined || skip === 0} onClick={handlePagingForward}>
          <NavigateNextIcon style={{ height: 32, width: 32 }} />
        </IconButton>
      </Stack>
    </Stack>
  );
};

const HistoryEntry: React.FC<HistoryDataEntry> = ({ judgementNr, judgementId }) => {
  const { route } = useRouting();
  const query = useQueryJudgement(judgementId);

  function handleEntryClick() {
    if (query.data !== undefined) {
      route.annotation.toEditPage(query.data.id);
    }
  }

  return (
    <Card onClick={handleEntryClick} style={{ height: HEIGHT_OF_HISTORY_ELEMENT }}>
      <CardActionArea css={commonStyles.fullHeight}>
        <Box
          sx={{ padding: (theme: Theme) => theme.spacing(1.5, 1) }}
          css={[commonStyles.fullHeight, commonStyles.borderBoxSizing]}
        >
          {query.isError ? (
            <Alert severity="error">
              <AlertTitle>Error occured</AlertTitle>
              {query.error}
            </Alert>
          ) : (
            <Stack alignItems="stretch" spacing={1.5} css={commonStyles.fullHeight}>
              <Stack direction="row" disableContainerStretch justifyContent="space-between">
                <Stack
                  direction="row"
                  alignItems="stretch"
                  css={commonStyles.flex.shrinkAndFitHorizontal}
                >
                  <TextBox bold>#{judgementNr}</TextBox>
                  <TextBox
                    bold
                    css={[
                      commonStyles.flex.shrinkAndFitHorizontal,
                      commonStyles.text.overflowEllipsis,
                    ]}
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
              <Stack direction="row" alignItems="stretch" justifyContent="space-between">
                <TextBox
                  textAlign="start"
                  css={[
                    commonStyles.flex.shrinkAndFitHorizontal,
                    commonStyles.text.overflowEllipsis,
                    commonStyles.grid.verticalCenter,
                  ]}
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
                <RateBadge
                  relevanceLevel={
                    query.isLoading || query.data === undefined
                      ? 'LOADING'
                      : query.data.relevanceLevel
                  }
                  css={styles.rateBadge}
                />
              </Stack>
            </Stack>
          )}
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default AnnotationHistory;
