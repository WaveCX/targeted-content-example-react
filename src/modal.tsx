import {ReactNode} from 'react';

import styles from './modal.module.css';

export const Modal = ({
  children,
  onCloseRequested,
}: {
  children: ReactNode;
  onCloseRequested: () => void;
}) => (
  <div className={styles.backdrop}>
    <div className={styles.container}>
      <button onClick={onCloseRequested}>Close</button>
      {children}
    </div>
  </div>
);