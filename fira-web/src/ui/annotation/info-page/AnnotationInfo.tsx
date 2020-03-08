import React from 'react';
import { useHistory } from 'react-router-dom';

import styles from './AnnotationInfo.module.css';
import Button from '../../elements/Button';
import { annotatorsService } from '../../../annotators/annotators.service';
import { ANNOTATE_RELATIVE_URL } from '../../App';

import infoPage01 from './info-page-01.png';
import infoPage02 from './info-page-02.png';

const AnnotationInfo: React.FC = () => {
  const history = useHistory();

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
    annotatorsService.acknowledgeInfoPage();
    history.push(ANNOTATE_RELATIVE_URL);
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
      <Button buttonType="primary" onClick={onAcknowledge}>
        Continue
      </Button>
    </div>
  );
};

export default AnnotationInfo;
