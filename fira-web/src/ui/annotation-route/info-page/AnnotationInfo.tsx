import React from 'react';

import styles from './AnnotationInfo.module.css';
import Button from '../../elements/Button';
import { annotatorStories } from '../../../stories/annotator.stories';
import { useRouting } from '../AnnotationRouter';

import infoPage01 from './info-page-01.png';
import infoPage02 from './info-page-02.png';

const AnnotationInfo: React.FC = () => {
  const annotationRouting = useRouting();

  const content = [
    {
      type: 'text',
      content: 'Choose a score for the document',
    },
    {
      type: 'image',
      content: infoPage01,
      alt: 'image showing how to choose a score',
    },
    {
      type: 'text',
      content: 'Select regions of the document relevant to the query',
    },
    {
      type: 'image',
      content: infoPage02,
      alt: 'image showing how to select regions of the document',
    },
  ] as const;

  function onAcknowledge() {
    annotatorStories.acknowledgeInfoPage();
    annotationRouting.routeToAnnotatePage();
  }

  return (
    <div className={styles.container}>
      <span className={styles.headline}>Info - How to annotate</span>
      {content.map((entry, idx) =>
        entry.type === 'text' ? (
          <span key={idx}>{entry.content}</span>
        ) : (
          <img key={idx} className={styles.infoImage} src={entry.content} alt={entry.alt} />
        ),
      )}
      <Button onClick={onAcknowledge}>Continue</Button>
    </div>
  );
};

export default AnnotationInfo;
