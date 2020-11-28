import React from 'react';

import HistoryIcon from '@material-ui/icons/History';
import InfoIcon from '@material-ui/icons/Info';

import TextBox from '../../elements/TextBox';
import Menu from '../../elements/Menu';
import Stack from '../../layouts/Stack';
import AnnotationComponent from '../elements/AnnotationComponent';
import { useRouting } from '../../MainRouter';
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
      mode="NEW_JUDGEMENT"
      judgementPair={currentJudgementPair}
      finishedFraction={finishedFraction}
      headlineComponents={
        alreadyFinished !== undefined &&
        remainingToFinish !== undefined && (
          <AnnotationMenu alreadyFinished={alreadyFinished} remainingToFinish={remainingToFinish} />
        )
      }
    />
  );
};

const AnnotationMenu: React.FC<{ alreadyFinished: number; remainingToFinish: number }> = ({
  alreadyFinished,
  remainingToFinish,
}) => {
  const { route } = useRouting();

  function handleShowHistoryPage() {
    route.annotation.toHistoryPage();
  }

  function handleShowInfoPage() {
    route.annotation.toInfoPage();
  }

  return (
    <Menu
      additionalMenuEntries={[
        {
          component: 'li',
          children: (
            <Stack justifyContent="center" alignItems="center">
              <TextBox disablePreserveNewlines textAlign="center">
                Finished <strong>{alreadyFinished}</strong> <br /> out of{' '}
                <strong>{alreadyFinished! + remainingToFinish}</strong>
              </TextBox>
            </Stack>
          ),
        },
        {
          component: 'MenuItem',
          children: (
            <Stack direction="row" spacing={1.5}>
              <HistoryIcon />
              <TextBox>History</TextBox>
            </Stack>
          ),
          onClick: handleShowHistoryPage,
        },
        {
          component: 'MenuItem',
          children: (
            <Stack direction="row" spacing={1.5}>
              <InfoIcon />
              <TextBox>Go to Info Page</TextBox>
            </Stack>
          ),
          onClick: handleShowInfoPage,
        },
      ]}
    />
  );
};

export default Annotation;
