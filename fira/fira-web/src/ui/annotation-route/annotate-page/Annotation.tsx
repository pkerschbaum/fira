import React from 'react';
import { MenuItem } from '@material-ui/core';

import HistoryIcon from '@material-ui/icons/History';
import InfoIcon from '@material-ui/icons/Info';

import TextBox from '../../elements/TextBox';
import Menu from '../../elements/Menu';
import Stack from '../../layouts/Stack';
import AnnotationComponent from '../elements/AnnotationComponent';
import { useRouting } from '../AnnotationRouter';
import { judgementStories } from '../../../stories/judgement.stories';
import { useAnnotationState } from '../../../state/annotation/annotation.hooks';

const Annotation: React.FC = () => {
  const { remainingToFinish, alreadyFinished, currentJudgementPair } = useAnnotationState();

  // compute fraction of finished annotation; used for progress bar
  let finishedFraction;
  if (remainingToFinish === undefined || alreadyFinished === undefined) {
    finishedFraction = 0;
  } else {
    finishedFraction =
      remainingToFinish === undefined
        ? 0
        : (alreadyFinished / (remainingToFinish + alreadyFinished)) * 100;
    if (finishedFraction > 100) {
      // user annotated more than his annotation target --> cap at 100%
      finishedFraction = 100;
    }
  }

  return (
    <AnnotationComponent
      key={currentJudgementPair?.id}
      judgementPair={currentJudgementPair}
      finishedFraction={finishedFraction}
      menuComponents={
        alreadyFinished !== undefined &&
        remainingToFinish !== undefined && (
          <AnnotationMenu alreadyFinished={alreadyFinished} remainingToFinish={remainingToFinish} />
        )
      }
      submitJudgement={judgementStories.submitJudgement}
      autoSubmit
    />
  );
};

const AnnotationMenu: React.FC<{ alreadyFinished: number; remainingToFinish: number }> = ({
  alreadyFinished,
  remainingToFinish,
}) => {
  const annotationRouting = useRouting();

  function handleShowHistoryPage() {
    annotationRouting.routeToHistoryPage();
  }

  function handleShowInfoPage() {
    annotationRouting.routeToInfoPage();
  }

  return (
    <Menu
      additionalItems={
        <>
          <Stack justifyContent="center" alignItems="center">
            <TextBox disablePreserveNewlines textAlign="center">
              Finished <strong>{alreadyFinished}</strong> <br /> out of{' '}
              <strong>{alreadyFinished! + remainingToFinish}</strong>
            </TextBox>
          </Stack>
          <MenuItem onClick={handleShowHistoryPage}>
            <Stack direction="row" spacing={1.5}>
              <HistoryIcon />
              <TextBox>History</TextBox>
            </Stack>
          </MenuItem>
          <MenuItem onClick={handleShowInfoPage}>
            <Stack direction="row" spacing={1.5}>
              <InfoIcon />
              <TextBox>Go to Info Page</TextBox>
            </Stack>
          </MenuItem>
        </>
      }
    />
  );
};

export default Annotation;
