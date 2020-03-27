import React from 'react';

import styles from './AnnotationFinished.module.css';
import { annotatorStories } from '../../../stories/annotator.stories';
import { useRouting } from '../AnnotationRouter';
import Button from '../../elements/Button';

const PartyPopperEmoji: React.FC = () => (
  <svg width="128" height="128">
    <g>
      <path
        d="M72.59,58.36c-0.65,1.18-1.3,2.37-1.92,3.55l-0.52,0.98l-0.05,0.08c1.83,2.43,3.4,5.04,4.64,7.69 c0.18,0.37,0.35,0.75,0.52,1.13c1.77-0.52,3.55-0.81,5.29-0.88c-1.31-3.47-3.33-7.07-6.3-10.71 C73.73,59.57,73.16,58.97,72.59,58.36z"
        style={{ fill: '#FCC21B' }}
      />
      <path
        d="M77.93,85.16c-0.37,0-0.75,0.02-1.13,0.06c-2.07,6.54-8.79,9.4-15.89,8.52 c-11.15-1.37-21.38-9.85-24.81-20.5c-0.7-2.13-0.94-4.25-1.02-6.51c-0.2-5.82,0.92-12.05,6.75-14.46l0.07-0.03 c0.19-0.08,0.38-0.13,0.57-0.19c-0.42-0.63-0.85-1.29-1.26-2.02c-0.58-1.03-0.93-2.12-1.14-3.18c-6.25,2.18-10.06,7.7-12.73,13.78 C24.79,66.45,8.22,111.2,8.22,111.2l-2.22,6c-0.76,2.08-1.94,4.17-1.94,6.44c0,2.65,2.36,4.46,5.02,3.72 c1.78-0.5,3.74-1.42,5.55-2.14c3.83-1.56,10.93-4.63,10.93-4.63l29.68-12.22c0,0,14.31-5.18,20.33-10.85 c2.92-2.75,5.26-6.71,6.29-11.44c-0.21-0.11-0.43-0.23-0.65-0.32C80.21,85.35,79.14,85.16,77.93,85.16z"
        style={{ fill: '#FCC21B' }}
      />
      <path
        d="M55.68,47.54c0.77,1.47,1.62,3.14,1.94,5.21c1.42,0.6,2.78,1.32,4.07,2.17 c0.45-1.44,0.92-2.86,1.41-4.31c-0.21-0.13-0.42-0.28-0.63-0.4c-2.11-1.2-4.48-2.22-6.95-2.98C55.58,47.34,55.63,47.43,55.68,47.54 z"
        style={{ fill: '#FCC21B' }}
      />
      <path
        d="M111.93,31.98c-0.16,1-0.12,2.42,0.04,3.4c0.17,1.1,0.42,2.27,0.82,3.31 c0.57,1.46,1.27,0.95,2.7,0.75c0.99-0.13,1.91-0.06,2.89-0.26c1.03-0.21,2.05-0.48,3.08-0.68c2.42-0.46,3.63-1,3.12-3.55 c-0.37-1.84-0.98-3.67-1.46-5.49c-0.44-0.39-1.29-0.17-1.81-0.05c-0.92,0.21-1.83,0.26-2.75,0.42c-1.66,0.27-3.4,0.47-5.03,0.86 C112.7,30.87,112.06,31.12,111.93,31.98z"
        style={{ fill: '#D7598B' }}
      />
      <path
        d="M98.87,62c0.38,0.87,1.31,0.65,2.22,0.85c2.02,0.46,4.07,0.41,6.14,0.41c0.77,0,2.72,0.29,3.27-0.4 c0.44-0.56,0.06-1.67,0-2.32c-0.08-0.85-0.16-1.69-0.24-2.54c-0.04-0.4,0.03-3.02-0.31-3.24c-0.58-0.39-1.68-0.2-2.34-0.19 c-1.21,0.04-2.4,0.19-3.63,0.19c-1.59,0-3.31,0.02-4.85,0.4c-0.54,1.43-0.39,2.92-0.39,4.49C98.74,60.38,98.58,61.32,98.87,62z"
        style={{ fill: '#40C0E7' }}
      />
      <path
        d="M91.92,105.19c-0.83-1.23-1.24-2.88-3.09-2.7c-1.74,0.17-3.28,1.55-4.81,2.3 c-0.99,0.48-1.71,1.34-1.91,2.42c-0.23,1.23,0.28,2.21,0.87,3.26c0.44,0.79,0.73,1.7,1.08,2.53c0.36,0.86,0.91,1.63,1.28,2.48 c0.25,0.6,0.17,0.55,0.72,0.76c0.28,0.1,0.74,0.18,1.04,0.19c1.75,0.05,3.65-1.72,4.92-2.76c1.02-0.82,3.06-1.34,2.85-2.89 c-0.15-1.15-0.95-2.26-1.5-3.25C92.91,106.72,92.42,105.94,91.92,105.19z"
        style={{ fill: '#D7598B' }}
      />
      <path
        d="M111.46,113.59c-0.23-0.15-0.45-0.24-0.65-0.27c-1.06-0.19-1.76,1.09-2.6,1.92 c-1.01,0.97-2.21,1.74-3.13,2.8c-0.99,1.16-0.22,2.2,0.8,2.82c1.11,0.67,2.1,1.51,3.2,2.21c0.98,0.63,1.77,1.19,2.86,0.51 c0.99-0.62,1.54-1.71,2.22-2.62c1.26-1.7,3.41-3.07,1.3-4.94C114.28,114.97,112.76,114.45,111.46,113.59z"
        style={{ fill: '#40C0E7' }}
      />
      <path
        d="M9,55.06c0.05-0.46,1.35-4.14,0.96-4.25c-0.89-0.22-1.73-0.64-2.63-0.88 c-1.04-0.27-2.11-0.48-3.08-0.96c-1.17-0.58-1.89-0.29-2.38,0.36c-0.69,0.92-0.91,2.57-1.24,3.58c-0.26,0.79-0.42,1.69,0.14,2.25 c0.64,0.63,1.7,0.99,2.53,1.26c1.04,0.34,2.2,0.94,3.27,1.04C8.03,57.62,8.85,56.3,9,55.06z"
        style={{ fill: '#40C0E7' }}
      />
      <path
        d="M68.63,19.54c1.3,0.58,2.56,0.91,3.89,1.29c0.47,0.14,0.77,0.37,1.26,0.11 c0.63-0.32,1.33-1.43,1.68-2.04c0.83-1.51,1.44-3,2.01-4.59c0.31-0.85,1.23-2.23,1-3.13c-0.2-0.76-1.3-1.23-1.92-1.56 c-0.83-0.43-1.62-1.01-2.46-1.38c-1.08-0.47-2.56-0.98-3.72-1.15c-0.64-0.1-1.09,0.16-1.44,0.57c-0.32,0.37-0.56,0.86-0.8,1.31 c-1.21,2.32-2.7,5.81-2.65,8.49C65.5,18.73,67.67,19.11,68.63,19.54z"
        style={{ fill: '#40C0E7' }}
      />
      <path
        d="M16.65,33.3c0.73,1.12,1.38,2.14,2.24,3.2c0.84,1.02,1.44,1.22,2.47,0.37 c0.65-0.52,1.39-0.93,2.01-1.49c0.59-0.52,1.08-1.18,1.67-1.72c0.42-0.39,1.25-0.78,1.49-1.32c0.33-0.76-0.36-1.42-0.78-1.98 c-0.52-0.7-0.92-1.46-1.49-2.16c-0.73-0.88-1.52-1.71-2.34-2.53c-0.67-0.67-1.48-1.7-2.24-2.22c-0.2-0.13-0.43-0.22-0.67-0.25 c-0.91-0.13-1.99,0.39-2.7,0.81c-0.97,0.57-1.91,1.42-2.76,2.17c-1.33,1.18-0.04,2.73,0.74,3.85 C15.07,31.11,15.91,32.16,16.65,33.3z"
        style={{ fill: '#D7598B' }}
      />
      <path
        d="M16.73,9.97c0.67,0.72,1.5,1.59,2.44,2c0.83,0.37,1.68-0.37,2.35-0.78c0.75-0.46,1.36-1.13,1.92-1.8 c0.51-0.62,1.2-1.29,1.58-2.01c0.44-0.82-0.16-1.13-0.77-1.62c-0.73-0.6-1.47-1.22-2.09-1.94c-0.84-0.98-1.68-2.08-2.57-2.98 c-0.3-0.31-0.66-0.39-1.04-0.32c-1.19,0.2-2.6,1.87-3.3,2.42c-0.56,0.43-1.54,1.19-1.71,1.9c-0.21,0.8,0.26,1.57,0.66,2.24 C14.85,8.16,15.85,9.03,16.73,9.97z"
        style={{ fill: '#40C0E7' }}
      />
      <path
        d="M45.86,29.19c1.38,4.78-2.3,8.47-2.7,13c-0.12,1.31-0.12,2.62,0.1,3.88 c0.14,0.82,0.37,1.62,0.78,2.35c0.54,0.96,1.16,1.83,1.73,2.73c0.56,0.87,1.06,1.75,1.4,2.76c0.75,2.24,0.23,4.26-0.09,6.48 c-0.26,1.77-1.16,3.44-2.24,4.84c-0.33,0.43-1.24,0.98-1.02,1.61c0.03,0.11,0.23,0.15,0.52,0.15c1.2,0,4.03-0.73,4.44-0.92 c1.8-0.87,2.85-2.63,3.78-4.33c1.38-2.52,2.27-5.46,1.88-8.35c-0.08-0.66-0.26-1.28-0.48-1.88c-0.67-1.79-1.78-3.39-2.41-5.22 c-0.08-0.22-0.16-0.44-0.22-0.67c-0.92-3.58,1.29-7.09,3.15-9.94c1.83-2.79,2.52-6.89,1.22-10.09c-0.66-1.62-1.72-3.24-3.01-4.43 c-1.53-1.42-3.86-2.71-3.6-5.16c0.22-2.13,1.66-4.37,2.75-6.13c0.54-0.89,2.24-2.71,2.18-3.73c-0.05-1.04-1.5-1.56-2.19-2.17 c-1.56-1.38-2.8-2.44-4.8-3.07c-0.36-0.12-0.66-0.17-0.94-0.17c-1.29,0-1.74,1.17-2.46,2.43c-1.32,2.33-2.62,4.79-3.5,7.31 c-1.66,4.68-1.91,9.51,1.68,13.89C43.05,25.89,45.34,27.39,45.86,29.19z"
        style={{ fill: '#ED6C30' }}
      />
      <path
        d="M62.08,69.54c0.25,0.26,0.48,0.37,0.69,0.37c0.39,0,0.7-0.4,0.95-0.87 c0.19-0.36,0.34-0.73,0.46-1.12c0.67-2.25,2-4.48,3.1-6.56c0.2-0.37,0.4-0.73,0.59-1.09c0.76-1.43,1.54-2.86,2.35-4.28 c0.63-1.12,1.26-2.25,1.94-3.33c1.78-2.85,4.18-5.89,7.2-7.48c1.9-1.02,4.04-1.49,5.95-2.5c2.17-1.13,3.44-2.84,4.85-4.79 c1.4-1.93,2.13-4.31,3.41-6.34c0.54-0.86,0.46-1.62,1.41-2.22c2.11-1.32,4.64-0.87,6.98-1.32c5.53-1.06,6.02-8.35,10.54-10.98 c0.95-0.55,1.92-1.06,2.88-1.57c0.56-0.3,1.64-0.67,2.03-1.22c0.67-0.94-0.6-2.17-0.98-3.03c-0.66-1.48-1.65-2.97-2.5-4.35 c-0.72-1.16-1.36-2.21-2.64-2.21l-0.25,0.02c-2.89,0.28-5.47,1.55-7.32,3.76c-2.25,2.7-2.55,6.87-6.09,8.35 c-2.3,0.96-5.01,0.58-7.19,1.91c-2.58,1.58-3.41,4.7-4.13,7.44c-0.54,2-0.57,4.41-2.09,5.98c-2.06,2.11-5.19,2.37-7.83,3.5 c-0.71,0.31-1.39,0.68-2,1.16c-3.35,2.64-5.25,6.97-6.75,10.85c-0.61,1.59-1.16,3.21-1.7,4.83c-0.5,1.51-0.99,3.02-1.46,4.54 c-0.24,0.78-0.5,1.56-0.74,2.35c-0.61,1.98-1.17,4.01-1.89,5.96C61.35,66.55,61.04,68.46,62.08,69.54z"
        style={{ fill: '#ED6C30' }}
      />
      <path
        d="M127.44,86.8c-0.19-0.2-0.46-0.22-0.73-0.22l-0.31,0.01l-0.17-0.01c-0.6-0.04-1.1-0.3-1.68-0.5 c-2.67-0.93-4.4-1.7-6.76-3.29c-2.66-1.79-5.71-3.46-8.99-3.61l-0.38-0.01c-3.24,0-6.23,1.71-9.48,1.71h-0.02 c-3.6-0.02-6.71-2.58-9.55-4.47c-0.24-0.16-0.48-0.31-0.74-0.45c-2.23-1.26-4.63-1.81-7.05-1.84c-0.06,0-0.13-0.02-0.19-0.02 c-1.67,0-3.35,0.26-4.99,0.72c-1.6,0.44-3.15,1.08-4.63,1.87c-2.11,1.12-4.14,2.47-5.99,3.97c-1.03,0.83-2.16,1.78-2.86,2.93 c-0.38,0.61-0.9,2.93,0.07,3.31l0.13,0.03c0.38,0,1-0.4,1.27-0.57c2.16-1.33,4.44-2.49,6.87-3.25c1.99-0.63,4.08-1.09,6.15-1.17 c0.17-0.01,0.35-0.02,0.52-0.02c1.49,0,2.97,0.23,4.41,0.79c0.02,0.01,0.04,0.02,0.06,0.03c2.01,0.8,3.69,2.18,5.35,3.53 c2.44,1.98,5.15,2.42,7.91,2.42c2.15,0,4.33-0.26,6.46-0.26c2.23,0,4.39,0.29,6.38,1.46c1.62,0.97,3.08,2.24,4.33,3.59 c1.38,1.47,3.14,2.7,5.21,3.02c0.88,0.14,1.68,0.21,2.57,0.22h0.02c1.5,0,2.07-1.73,2.83-2.72c1.04-1.34,1.76-2.88,2.71-4.29 C126.57,89.09,128.12,87.48,127.44,86.8z"
        style={{ fill: '#ED6C30' }}
      />
    </g>
  </svg>
);

const AnnotationFinished: React.FC = () => {
  const annotationRouting = useRouting();

  function onAcknowledge() {
    annotatorStories.acknowledgePage('FINISHED');
    annotationRouting.routeToAnnotatePage();
  }

  return (
    <div className={styles.container}>
      <span className={styles.headline}>Congratulations!</span>
      <div className={styles.finishedLogo}>
        <PartyPopperEmoji />
      </div>
      <div>
        <div>You finished your annotation target!</div>
        <div>Feel free to continue annotating!</div>
      </div>
      <Button className={styles.button} buttonType="primary" onClick={onAcknowledge}>
        Continue
      </Button>
    </div>
  );
};

export default AnnotationFinished;
