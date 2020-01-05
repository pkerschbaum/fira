import React, { useState, useRef } from 'react';
import * as d3 from 'd3';

import styles from './Admin.module.css';
import { adminService } from '../../admin/admin.service';
import { ImportStatus } from '../../http/http.client';
import { isNotEmpty } from '../../util/strings';

interface GeneratedUser {
  id: string;
  password?: string;
  error?: string;
  status: ImportStatus;
}

const COLUMN_NAME_USER_ID = 'id';

const Admin: React.FC = () => {
  const [importedUsers, setImportedUsers] = useState([] as GeneratedUser[]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function importUsers() {
    if (fileInputRef.current!.files?.length) {
      const fReader = new FileReader();
      fReader.readAsText(fileInputRef.current!.files[0]);
      fReader.onloadend = async e => {
        const fileContent = e.target?.result as string;
        const requestData = d3
          .tsvParse(fileContent)
          .filter(entry => !!entry[COLUMN_NAME_USER_ID] && isNotEmpty(entry[COLUMN_NAME_USER_ID]!))
          .map(entry => {
            return { id: entry[COLUMN_NAME_USER_ID] };
          }) as Array<{ id: string }>;
        const importResult = (await adminService.importUsers(requestData)).importedUsers;
        setImportedUsers(importResult);
        fileInputRef.current!.value = '';
      };
    }
  }

  return (
    <div>
      <div>
        <div className={styles.dataHeadline}>Users</div>
        <div className={styles.dataMain}>
          <div className={styles.dataActionsBar}>
            {importedUsers.length > 0 && <input type="button" value="Export Generated Users" />}
            <input
              type="button"
              value="Import Users"
              onClick={() => fileInputRef.current!.click()}
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple={false}
              accept=".tsv"
              style={{ display: 'none' }}
              onChange={importUsers}
            />
          </div>
          <div style={{ display: 'inline-block' }}>
            <div className={styles.dataElements}>
              {importedUsers.map(user => (
                <div className={styles.dataEntry} key={user.id}>
                  {user.status === ImportStatus.SUCCESS
                    ? `User-ID: ${user.id}, Password: ${user.password}`
                    : `User-ID: ${user.id}, Error: ${user.error}`}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
