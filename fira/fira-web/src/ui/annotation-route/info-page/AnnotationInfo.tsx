import React from 'react';
import { Box } from '@material-ui/core';

import infoPageLabels from './info-page-labels.png';
import infoPageSpan from './info-page-span-example.png';
import infoEx1 from './info-example-wrong.png';
import infoEx2 from './info-example-topic.png';
import infoEx3 from './info-example-partial.png';
import infoEx4 from './info-example-perfect.png';

import Button from '../../elements/Button';
import TextBox from '../../elements/TextBox';
import Stack from '../../layouts/Stack';
import { useRouting } from '../../MainRouter';
import { annotatorStories } from '../../../stories/annotator.stories';

import { styles } from './AnnotationInfo.styles';

const AnnotationInfo: React.FC = () => {
  const { route } = useRouting();

  const content = [
    {
      type: 'text',
      content:
        'Welcome to Fira! Our goal is to create fine-grained relevance annotations for query - document snippet pairs. ' +
        'In the annotation interface you will see 1 query and 1 document snippet and a range of relevance classes to select.',
    },
    {
      type: 'image',
      content: infoPageLabels,
      alt: 'available relevance classes',
    },
    {
      type: 'text',
      content:
        'For each pair you must select 1 from 4 relevance classes: </br><ul>' +
        '<li><b>Wrong</b> If the document has nothing to do with the query, and does not help in any way to answer it</li>' +
        '<li><b>Topic</b> If the document talks about the general area or topic of a query, might provide some background info, but ultimately does not answer it</li>' +
        '<li><b>Partial</b> The document contains a partial answer, but you think that there should be more to it</li>' +
        '<li><b>Perfect</b> The document contains a full answer: easy to understand and it directly answers the question in full</li>' +
        '</ul>',
    },
    {
      type: 'text',
      content:
        '<hr><b>Important annotation guidelines and Fira usage tips:</b> <br><br>' +
        "<b>(1)</b> You should use your general knowledge to deduce links between query and answers, but if you don't know what the question (or part of it such as an acronym) means, " +
        'fall back to see if the document clearly explains the question and answer and if not score it as <b>Wrong</b> or <b>Topic</b> only. We do not assume specific domain knowledge requirements. <br>' +
        '<b>(2)</b> For <b>Partial</b> and <b>Perfect</b> grades you need to select the text spans, that are in fact the relevant text parts to the questions. You can select multiple words (the span) with your mouse or by once tapping or clicking on the start and once on the end of the span. ' +
        'You can select more than one and you can also select them before clicking on the grade button. Below is an example of two selected spans:',
    },
    {
      type: 'image',
      content: infoPageSpan,
      alt: 'example for two selected spans',
    },
    {
      type: 'text',
      content:
        '<b>(3)</b> On the desktop you can use the keys 1-4 on your keyboard to quickly select the relevance label.',
    },
    {
      type: 'text',
      content:
        "<hr> Now before we get started, let's have a look at an example from each relevance grade:",
    },
    {
      type: 'image',
      content: infoEx1,
      alt: 'example for relevance grade wrong',
    },
    {
      type: 'image',
      content: infoEx2,
      alt: 'example for relevance grade topic',
    },
    {
      type: 'image',
      content: infoEx3,
      alt: 'example for relevance grade partial',
    },
    {
      type: 'image',
      content: infoEx4,
      alt: 'example for relevance grade perfect',
    },
    {
      type: 'text',
      content:
        'Your goal is to annotate 500 examples. You can do it on any device. You can always come back to this info page, via the dropdown menu in the upper-right corner.<br>Thank you for your work!',
    },
  ] as const;

  function onAcknowledge() {
    annotatorStories.acknowledgePage('INFO');
    route.annotation.toAnnotatePage();
  }

  return (
    <Stack alignItems="stretch" spacing={2} css={styles.container}>
      <TextBox fontSize="lg" bold textAlign="center">
        How to annotate
      </TextBox>
      {content.map((entry, idx) =>
        entry.type === 'text' ? (
          <TextBox key={idx}>
            <Box dangerouslySetInnerHTML={{ __html: entry.content }} />
          </TextBox>
        ) : (
          <img key={idx} css={styles.infoImage} src={entry.content} alt={entry.alt} />
        ),
      )}
      <Button variant="contained" onClick={onAcknowledge}>
        Let's get started!
      </Button>
    </Stack>
  );
};

export default AnnotationInfo;
