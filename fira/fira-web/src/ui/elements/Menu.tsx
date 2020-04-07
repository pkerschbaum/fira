import React, { useState } from 'react';
import { Manager, Reference, Popper } from 'react-popper';

import styles from './Menu.module.css';
import Button from './Button';
import { useOnViewportClick } from '../util/events.hooks';
import { useUserActions } from '../../store/user/user.hooks';
import { useRouting } from '../annotation-route/AnnotationRouter';

const MenuButton = React.forwardRef<HTMLButtonElement, { onClick: () => void }>(
  ({ onClick }, ref) => (
    <Button ref={ref} buttonType="tertiary" className={styles.menuButton} onClick={onClick}>
      {/* https://material.io/resources/icons/?icon=more_vert&style=baseline */}
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
    </Button>
  ),
);

const Menu: React.FC<{ additionalInfo?: React.ReactNode }> = ({ additionalInfo }) => {
  const [showMenu, setShowMenu] = useState(false);
  useOnViewportClick(() => setShowMenu(false));
  const userActions = useUserActions();
  const annotationRouting = useRouting();

  function onLogout() {
    userActions.logout();
  }

  function onShowInfoPage() {
    annotationRouting.routeToInfoPage();
  }

  function toggleShowMenu() {
    setShowMenu((oldVal) => !oldVal);
  }

  function createMenuButton(ref?: React.Ref<HTMLButtonElement>) {
    return <MenuButton onClick={toggleShowMenu} ref={ref} />;
  }

  return !showMenu ? (
    createMenuButton()
  ) : (
    <Manager>
      <Reference>{({ ref }) => createMenuButton(ref)}</Reference>
      <Popper placement="bottom-end">
        {({ ref, style, placement }) => (
          <div ref={ref} style={style} className={styles.container} data-placement={placement}>
            {additionalInfo === undefined ? null : (
              <div className={styles.additionalInfo}>{additionalInfo}</div>
            )}
            <Button onClick={onShowInfoPage}>Go to Info Page</Button>
            <Button onClick={onLogout}>Logout</Button>
          </div>
        )}
      </Popper>
    </Manager>
  );
};

export default Menu;
