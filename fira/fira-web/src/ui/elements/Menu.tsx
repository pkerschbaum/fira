import React, { useState } from 'react';
import { IconButton, Menu as MuiMenu, MenuItem } from '@material-ui/core';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import HistoryIcon from '@material-ui/icons/History';
import InfoIcon from '@material-ui/icons/Info';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import TextBox from './TextBox';
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

  function handleShowHistoryPage() {
    annotationRouting.routeToHistoryPage();
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
        <MenuItem onClick={handleShowHistoryPage}>
          <Stack direction="row" spacing={1.5}>
            <HistoryIcon />
            <TextBox>History</TextBox>
          </Stack>
        </MenuItem>
        <MenuItem onClick={handleShowInfoPage}>
          <Stack direction="row" spacing={1.5}>
            <InfoIcon />
            <TextBox>Go to Info Page</TextBox>
          </Stack>
        </MenuItem>
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
