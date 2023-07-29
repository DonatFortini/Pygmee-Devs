import * as React from 'react';
import { useContextMenu } from '../hooks/useContextMenu';

import styles from '../public/ContextMenu.module.css';

type Props = {
  items: Array<string>;
  onClick: (item: string) => void;
};

const ContextMenu = ({ items }: Props) => {
  const { anchorPoint, isShown } = useContextMenu();

  if (!isShown) {
    return null;
  }

  return (
    <ul
      className={styles.ContextMenu}
      style={{ top: anchorPoint.y, left: anchorPoint.x }}
    >
      {items.map((item) => (
        <li key={item} onClick={() => onClick(item)}>{item}</li>
      ))}
    </ul>
  );
};

export { ContextMenu };