import React from 'react';
import { useHistory } from 'react-router-dom';

import Button from '../elements/Button';
import { annotatorsService } from '../../annotators/annotators.service';
import { ANNOTATE_RELATIVE_URL } from '../App';

const AnnotationInfo: React.FC = () => {
  const history = useHistory();

  return (
    <div>
      <span>Info screen placeholder</span>
      <Button
        buttonType="primary"
        onClick={() =>
          annotatorsService.acknowledgeInfoScreen(() => history.push(ANNOTATE_RELATIVE_URL))
        }
      >
        Annotate
      </Button>
    </div>
  );
};

export default AnnotationInfo;
