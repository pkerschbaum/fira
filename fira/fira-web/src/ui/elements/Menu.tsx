import React, { useState } from 'react';
import { IconButton, Menu as MuiMenu, MenuItem } from '@material-ui/core';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import TextBox from './TextBox';
import Stack from '../layouts/Stack';
import { useUserActions } from '../../state/user/user.hooks';
import { assertUnreachable } from '../../../../fira-commons';

type MenuEntry = {
  component: 'li' | 'MenuItem';
  children: React.ReactNode;
  onClick?: () => void;
};

const Menu: React.FC<{ additionalMenuEntries?: MenuEntry[] }> = ({ additionalMenuEntries }) => {
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

  const menuItems: MenuEntry[] = [
    ...(additionalMenuEntries ?? []),
    {
      component: 'MenuItem',
      children: (
        <Stack direction="row" spacing={1.5}>
          <ExitToAppIcon />
          <TextBox>Logout</TextBox>
        </Stack>
      ),
      onClick: handleLogout,
    },
  ];

  return (
    <>
      <IconButton style={{ marginBottom: -8 }} onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <MuiMenu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {menuItems.map((item, idx) =>
          item.component === 'li' ? (
            <li key={idx} onClick={item.onClick}>
              {item.children}
            </li>
          ) : item.component === 'MenuItem' ? (
            <MenuItem key={idx} onClick={item.onClick}>
              {item.children}
            </MenuItem>
          ) : (
            assertUnreachable(item.component)
          ),
        )}
      </MuiMenu>
    </>
  );
};

export default Menu;
