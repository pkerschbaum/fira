import React, { useState } from 'react';
import {
  Dialog as MDialog,
  DialogProps as MDialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
  CircularProgress,
  Box,
} from '@material-ui/core';

import Stack from '../layouts/Stack';
import { strings } from '@fira-commons';

import { commonStyles } from '../Common.styles';

export type DialogProps<FormValues extends {}> = {
  id: string; // dialog id
  open: boolean;
  title?: string;
  confirmationButtonLabel?: string;
  hideAbortButton?: boolean;
  content?: React.ReactNode;
  onClose?: (
    arg: { chosenOption: 'CANCEL' } | { chosenOption: 'OK'; dialogResult: FormValues },
  ) => void | Promise<void>;
  children?: React.ReactNode;
  mDialogProps?: Omit<MDialogProps, 'open'>;
};

function Dialog<FormValues extends {}>(props: DialogProps<FormValues>) {
  const {
    id,
    title,
    confirmationButtonLabel,
    hideAbortButton,
    content,
    open,
    onClose,
    children,
    mDialogProps,
  } = props;

  const [isClosing, setIsClosing] = useState(false);

  const handleOk = async (value: FormValues) => {
    if (onClose !== undefined) {
      setIsClosing(true);
      await onClose({ chosenOption: 'OK', dialogResult: value });
      setIsClosing(false);
    }
  };

  const handleCancel = async () => {
    if (onClose !== undefined) {
      setIsClosing(true);
      await onClose({ chosenOption: 'CANCEL' });
      setIsClosing(false);
    }
  };

  const showConfirmationButton = !strings.isNullishOrEmpty(confirmationButtonLabel);

  return (
    <MDialog {...mDialogProps} maxWidth={mDialogProps?.maxWidth ?? 'xs'} open={open} id={id}>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent dividers>
        {content !== undefined && (
          <DialogContentText color="textPrimary" css={commonStyles.preserveNewlines}>
            {content}
          </DialogContentText>
        )}
        {children}
      </DialogContent>
      {(!hideAbortButton || showConfirmationButton || isClosing) &&
        (isClosing ? (
          <Box>
            <Stack direction="row" justifyContent="flex-end">
              <CircularProgress color="primary" />
            </Stack>
          </Box>
        ) : (
          <DialogActions>
            {!hideAbortButton && (
              <Button autoFocus onClick={handleCancel}>
                Abort
              </Button>
            )}
            {showConfirmationButton && (
              <Button
                autoFocus={hideAbortButton}
                onClick={() => handleOk((undefined as any) as FormValues)}
              >
                {confirmationButtonLabel}
              </Button>
            )}
          </DialogActions>
        ))}
    </MDialog>
  );
}

export default Dialog;
