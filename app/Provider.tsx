'use client';
import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
function Provider({ children }: Props) {
  return (
    <div>{children}</div>
  );
}

export default Provider;
