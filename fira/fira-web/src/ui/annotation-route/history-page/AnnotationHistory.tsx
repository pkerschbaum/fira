import React from 'react';
import { Box, Card, CardActionArea, IconButton, Theme } from '@material-ui/core';

import CancelIcon from '@material-ui/icons/Cancel';
import EditIcon from '@material-ui/icons/Edit';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

import TextBox from '../../elements/TextBox';
import Stack from '../../layouts/Stack';
import { RateBadge } from '../annotate-page/RateButton';
import { useRouting } from '../AnnotationRouter';
import { judgementsSchema } from '../../../../../fira-commons';

import { styles } from './AnnotationHistory.styles';
import { commonStyles } from '../../Common.styles';

type HistoryDataEntry = {
  judgementNr: number;
  judgementId: number;
  queryText: string;
  documentText: string;
  relevanceLevel: judgementsSchema.RelevanceLevel;
};

const dummyData: HistoryDataEntry[] = [
  {
    judgementNr: 97,
    judgementId: 1,
    queryText: `do goldfish grow`,
    documentText:
      'Caring for Your Goldfish in a Fish Bowl Without an Air Pump Pet Helpful » Fish & Aquariums » Freshwater',
    relevanceLevel: judgementsSchema.RelevanceLevel.GOOD_ANSWER,
  },
  {
    judgementNr: 96,
    judgementId: 2,
    queryText: `causes of military suicide`,
    documentText:
      'Veterans Health Administration Getting help for PTSD is problem solving , not a sign of weakness . Take the step . Compiled by Rebecca Matteo , Ph D , Web Content Manager , VA ’s National Center for PTSDThursday , June 27 , 2013June 27 is PTSD Awareness Day To mark PTSD Awareness Day , here is a list of “ 27 Things to Know ” about post - traumatic stress disorder . The list is compiled from our experts at VA ’s National Center for PTSD . The Center conducts research and provides education on trauma and PTSD . Just because someone experiences a traumatic event does not mean they have PTSD . No matter how long it ’s been since your trauma , treatment can help . To know whether you have PTSD , you should get an assessment from a clinician .',
    relevanceLevel: judgementsSchema.RelevanceLevel.TOPIC_RELEVANT_DOES_NOT_ANSWER,
  },
  {
    judgementNr: 95,
    judgementId: 3,
    queryText: `right pelvic pain causes`,
    documentText:
      'Appendix Appendix , formally vermiform appendix , in anatomy , a vestigial hollow tube that is closed at one end and is attached at the other end to the cecum , a pouchlike beginning of the large intestine into which the small intestine empties its contents . It is not clear whether the appendix serves any useful purpose in humans . Suspected functions include housing and cultivating beneficial gut flora that can repopulate the digestive system following an illness that wipes out normal populations of these flora ; providing a site for the production of endocrine cells in the fetus that produce molecules important in regulating homeostasis ; and serving a possible role in immune function during the first three decades of life by exposing leukocytes ( white blood cells ) to antigens in the gastrointestinal tract , thereby stimulating antibody production that may help modulate immune reactions in the gut .',
    relevanceLevel: judgementsSchema.RelevanceLevel.NOT_RELEVANT,
  },
  {
    judgementNr: 94,
    judgementId: 4,
    queryText: `do goldfish grow`,
    documentText:
      'Nutrition : I did not overfeed or underfeed , and I offered necessary vitamins and nutrients in a varied diet . Environmental enrichment : By adding diversity to the habitat , I encouraged explorative behaviors which come naturally to goldfish . Water quality : I performed frequent water changes with properly treated tap water , maintained healthy water temperatures , and regularly cleaned habitat accessories ( e.g. , substrate ) . [ Fish bowls ] are NOT easy to care for . In fact , it becomes easier to care for aquatic pets the larger the environment you keep them in . — Keith Seyffarth Make sure your bowl or tank is big enough to accommodate your fish . Avoid overcrowding . Adequate Space Requirements Goldfish require space , so buy the biggest habitat you can afford with the largest surface area . Consider upgrading affordably by shopping at garage sales for used aquariums .',
    relevanceLevel: judgementsSchema.RelevanceLevel.GOOD_ANSWER,
  },
  {
    judgementNr: 93,
    judgementId: 5,
    queryText: `do goldfish grow`,
    documentText:
      'Caring for Your Goldfish in a Fish Bowl Without an Air Pump Pet Helpful » Fish & Aquariums » Freshwater',
    relevanceLevel: judgementsSchema.RelevanceLevel.PERFECT_ANSWER,
  },
];

const AnnotationHistory: React.FC = () => {
  const { routeToAnnotatePage } = useRouting();

  function handleCloseHistory() {
    routeToAnnotatePage();
  }

  function handlePagingBack() {
    // TODO implement
  }

  function handlePagingForward() {
    // TODO implement
  }

  return (
    <Stack alignItems="stretch">
      <Stack direction="row" justifyContent="space-between">
        <Box />
        <IconButton style={{ padding: 4 }} onClick={handleCloseHistory}>
          <CancelIcon />
        </IconButton>
      </Stack>
      <Stack alignItems="stretch">
        {dummyData.map((entry) => (
          <HistoryEntry key={entry.judgementNr} {...entry} />
        ))}
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <IconButton style={{ padding: 4 }} onClick={handlePagingBack}>
          <NavigateBeforeIcon style={{ height: 32, width: 32 }} />
        </IconButton>
        <IconButton style={{ padding: 4 }} onClick={handlePagingForward}>
          <NavigateNextIcon style={{ height: 32, width: 32 }} />
        </IconButton>
      </Stack>
    </Stack>
  );
};

const HistoryEntry: React.FC<HistoryDataEntry> = ({
  judgementNr,
  judgementId,
  queryText,
  documentText,
  relevanceLevel,
}) => {
  // TODO fetch data from server

  function handleEntryClick() {
    // TODO implement
    console.log(judgementId);
  }

  return (
    <Card onClick={handleEntryClick}>
      <CardActionArea>
        <Box sx={{ padding: (theme: Theme) => theme.spacing() }}>
          <Stack alignItems="stretch" spacing={1.5}>
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" css={commonStyles.flex.shrinkAndFit}>
                <TextBox bold>#{judgementNr}</TextBox>
                <TextBox bold css={commonStyles.text.overflowEllipsis}>
                  {queryText}
                </TextBox>
              </Stack>
              <EditIcon />
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <TextBox
                textAlign="start"
                css={[commonStyles.text.overflowEllipsis, commonStyles.flex.shrinkAndFit]}
              >
                {documentText}
              </TextBox>
              <Box>
                <RateBadge relevanceLevel={relevanceLevel} css={styles.rateBadge} />
              </Box>
            </Stack>
          </Stack>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default AnnotationHistory;
