import React from 'react';
import { IconButton } from '@material-ui/core';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';

import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';

import Stack from '../../layouts/Stack';
import AnnotationComponent from '../elements/AnnotationComponent';
import { useRouting } from '../../MainRouter';
import { judgementStories } from '../../../stories/judgement.stories';

const EditAnnotation: React.FC = () => {
  const { route } = useRouting();
  const { id: judgementId } = useParams<{ id: string }>();
  const query = useQuery(
    ['judgement', judgementId],
    () => judgementStories.loadJudgementById(Number(judgementId)),
    { retry: false, refetchInterval: false, cacheTime: 0 },
  );

  const annotatedRanges: Array<{ start: number; end: number }> = [];
  if (query.data !== undefined && query.data.relevancePositions.length > 0) {
    let currentStart = query.data.relevancePositions[0];
    let currentEnd = query.data.relevancePositions[0];

    for (let i = 1; i < query.data.relevancePositions.length; i++) {
      const relevancePosition = query.data.relevancePositions[i];
      if (relevancePosition === currentEnd + 1) {
        currentEnd = relevancePosition;
      } else {
        annotatedRanges.push({ start: currentStart, end: currentEnd });
        currentStart = relevancePosition;
        currentEnd = relevancePosition;
      }
    }

    annotatedRanges.push({ start: currentStart, end: currentEnd });
  }

  return (
    <AnnotationComponent
      key={judgementId}
      mode="EDIT_JUDGEMENT"
      judgementPair={query.data === undefined ? undefined : { ...query.data, annotatedRanges }}
      finishedFraction={0}
      headlineComponents={({ handleSubmitJudgement }) => (
        <Stack direction="row">
          <IconButton
            disabled={handleSubmitJudgement === undefined}
            onClick={async () => {
              if (handleSubmitJudgement !== undefined) {
                await handleSubmitJudgement();
                route.annotation.toHistoryPage();
              }
            }}
          >
            <DoneIcon style={{ width: 28, height: 28 }} />
          </IconButton>
          <IconButton onClick={route.annotation.toHistoryPage}>
            <CloseIcon style={{ width: 28, height: 28 }} />
          </IconButton>
        </Stack>
      )}
      submitJudgement={judgementStories.submitJudgement}
    />
  );
};

export default EditAnnotation;
