import React from 'react';

import { adminService } from '../../admin/admin.service';

const Admin: React.FC = () => {
  return (
    <div>
      <button onClick={adminService.exportJudgements}>Export Judgements</button>
    </div>
  );
};

export default Admin;
