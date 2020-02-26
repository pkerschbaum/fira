import React, { useState, useEffect } from 'react';

import styles from './Admin.module.css';
import { adminService } from '../../admin/admin.service';
import Button from '../elements/Button';
import { Statistic } from '../../typings/fira-be-typings';
import Menu from '../elements/Menu';

const Admin: React.FC = () => {
  const [statistics, updateStatistics] = useState<Statistic[] | undefined>(undefined);

  useEffect(() => {
    async function fetchStatisticsAndUpdate() {
      updateStatistics((await adminService.getStatistics()).statistics);
    }

    fetchStatisticsAndUpdate();
  }, [updateStatistics]);

  return (
    <div className={styles.container}>
      <div className={styles.adminArea}>
        <div className={styles.topBar}>
          <Button
            className={styles.exportJudgementsButton}
            buttonType="primary"
            onClick={adminService.exportJudgements}
          >
            Export Judgements
          </Button>
          <Menu />
        </div>
        <div className={styles.statisticsContainer}>
          {statistics &&
            statistics.map(statistic => (
              <div className={styles.statistic}>
                <div className={styles.statisticValue}>{statistic.value}</div>
                <div className={styles.statisticLabel}>{statistic.label}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
