import React, { useState } from 'react';
import { IconButton, Menu as MuiMenu, MenuItem } from '@material-ui/core';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import TextBox from './TextBox';
import Stack from '../layouts/Stack';
import { useUserActions } from '../../state/user/user.hooks';

const Menu: React.FC<{ additionalItems?: React.ReactNode }> = ({ additionalItems }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const userActions = useUserActions();

  function handleLogout() {
    userActions.logout();
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton style={{ marginBottom: -8 }} onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <MuiMenu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {additionalItems === undefined ? null : additionalItems}
        <MenuItem onClick={handleLogout}>
          <Stack direction="row" spacing={1.5}>
            <ExitToAppIcon />
            <TextBox>Logout</TextBox>
          </Stack>
        </MenuItem>
      </MuiMenu>
    </>
  );
};

export default Menu;
