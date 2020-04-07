import React, { useState } from 'react';

import styles from './App.module.css';
import MainRouter from './ui/MainRouter';
import Dialog from './ui/elements/Dialog';
import { browserStorage } from './browser-storage/browser-storage';
import { useKeyupEvent } from './ui/util/events.hooks';

const KEY_H_CODE = 'KeyH';

const App: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  useKeyupEvent({
    [KEY_H_CODE]: { additionalKeys: ['ALT'], handler: () => setDialogOpen((oldVal) => !oldVal) },
  });

  return (
    <div className={styles.app}>
      {dialogOpen && (
        <Dialog onClose={() => setDialogOpen(false)}>
          Your client id is: <strong>{browserStorage.getClientId()}</strong>
        </Dialog>
      )}
      <MainRouter />
    </div>
  );
};

export default App;
