import React, { useState } from 'react';
import { IconButton, Menu as MuiMenu, MenuItem } from '@material-ui/core';

import MoreVertIcon from '@material-ui/icons/MoreVert';

import Stack from '../layouts/Stack';
import { useUserActions } from '../../state/user/user.hooks';
import { useRouting } from '../annotation-route/AnnotationRouter';

const Menu: React.FC<{ additionalInfo?: React.ReactNode }> = ({ additionalInfo }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const userActions = useUserActions();
  const annotationRouting = useRouting();

  function handleLogout() {
    userActions.logout();
  }

  function handleShowInfoPage() {
    annotationRouting.routeToInfoPage();
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton style={{ padding: 4, marginBottom: -8 }} onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <MuiMenu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {additionalInfo === undefined ? null : (
          <Stack justifyContent="center" alignItems="center">
            {additionalInfo}
          </Stack>
        )}
        <MenuItem onClick={handleShowInfoPage}>Go to Info Page</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </MuiMenu>
    </>
  );
};

export default Menu;
