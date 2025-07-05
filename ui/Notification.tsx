'use client';
import React, { useRef, useEffect } from 'react';

import { Toast } from 'primereact/toast';

/* 
  Replace values with desired options
  ====================

  const severity = 'warn'; // or 'success', 'info', 'error'
  const summary = 'Filled data to sign in are invalid';
  const detail = 'Please verify your email'
  Show the notification by calling the showNotification function
  with the appropriate severity, summary, and detail messages.
  
  Render the Notification component on a return() page
  ====================

  <Notification severity={severity} summary={summary} detail={detail} /> 
*/

const Notification = ({
  severity,
  summary,
  detail,
}: {
  severity?: string;
  summary?: string;
  detail?: string;
}) => {
  const toastRef = useRef<any>(null);

  useEffect(() => {
    if (toastRef.current) {
      toastRef.current.show({
        severity: severity,
        summary: summary,
        detail: detail,
        life: 3000,
      });
    }
  }, [severity, summary, detail]);

  return (
    <div>
      <Toast ref={toastRef} />
    </div>
  );
};

export default Notification;
