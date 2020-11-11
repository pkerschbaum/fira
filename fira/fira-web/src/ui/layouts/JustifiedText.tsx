import React, { useState, useRef, useLayoutEffect } from 'react';
import { Box } from '@material-ui/core';
import { ResizeSensor } from 'css-element-queries';

import { styles } from './JustifiedText.styles';

const WHITESPACE = ' ';

const JustifiedText: React.FC<{
  text: string[];
  createTextNode: (arg: { textPart: string; partIdx: number }) => React.ReactNode;
  parentContainerRef: React.RefObject<HTMLElement>;
}> = ({ text, createTextNode, parentContainerRef }) => {
  const placeholderRef = useRef<HTMLSpanElement>(null);
  const [textLines, setTextLines] = useState(
    [] as Array<Array<{ originalPartIdx: number; textPart: string }>>,
  );
  const [parentWidth, setParentWidth] = useState(0);

  const parentContainer = parentContainerRef.current;

  useLayoutEffect(
    function registerResizeObserver() {
      if (parentContainer) {
        setParentWidth(parentContainer.offsetWidth);
        const resizeSensor = new ResizeSensor(parentContainer, () => {
          setParentWidth(parentContainer.offsetWidth);
        });
        return () => resizeSensor.detach();
      }
    },
    [parentContainer],
  );

  useLayoutEffect(
    function computeTextLines() {
      // inspired by DreamTeK, see https://stackoverflow.com/a/38867270/1700319
      const placeholder = placeholderRef.current;

      if (placeholder) {
        // compute lines
        placeholder.textContent = '';
        let currentLine: Array<{ originalPartIdx: number; textPart: string }> = [];
        const computedLines = [];
        for (let partIdx = 0; partIdx < text.length; partIdx++) {
          const textPart = text[partIdx];
          placeholder.textContent += textPart;
          if (placeholder.offsetWidth <= parentWidth) {
            currentLine.push({ textPart, originalPartIdx: partIdx });
          } else {
            // width exceeded
            computedLines.push(currentLine);
            currentLine = [{ textPart, originalPartIdx: partIdx }];
            placeholder.textContent = textPart;
          }
        }
        // push last line and remove placeholder text content
        computedLines.push(currentLine);
        placeholder.textContent = '';

        // remove whitespaces at the beginning and the end of every line
        for (const line of computedLines) {
          while (line.length > 0 && line[0].textPart === WHITESPACE) {
            line.splice(0, 1);
          }
          while (line.length > 0 && line[line.length - 1].textPart === WHITESPACE) {
            line.splice(line.length - 1, 1);
          }
        }

        // set the computed lines in state
        setTextLines(computedLines);
      }
    },
    [text, parentWidth],
  );

  return (
    <>
      {textLines.map((line, lineIdx) => {
        const isLastLine = lineIdx === textLines.length - 1;

        return (
          <Box key={lineIdx} css={!isLastLine ? styles.line : styles.lastLine}>
            {line.map((part) =>
              createTextNode({ textPart: part.textPart, partIdx: part.originalPartIdx }),
            )}
          </Box>
        );
      })}
      <Box component="span" css={styles.hiddenPlaceholder} ref={placeholderRef} />
    </>
  );
};

export default JustifiedText;
