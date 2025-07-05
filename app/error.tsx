'use client';

import React, { useState } from 'react';

import Button from '@/ui/Button';
// import Notification from '@/ui/Notification';

// https://nextjs.org/docs/app/building-your-application/routing/error-handling

export default function Error({ error, reset }: any) {
  const [detail, setDetail] = useState<string>('');

  React.useEffect(() => {
    if (error) {
      setDetail(error.message);
    } else {
      setDetail('Unknown error');
    }

    // <Notification
    //   severity="error"
    //   summary="Check following details"
    //   detail={detail}
    // />;
  }, [error]);

  return (
    <div className="space-y-4" style={{ padding: '1.75rem' }}>
      {/* Render the Notification component here, and it will update when the detail state changes */}
      {/* {detail && (
        <Notification
          severity="error"
          summary="Error: check following details"
          detail={detail}
        />
      )} */}

      <div className="text-vercel-pink text-sm">
        <strong className="font-bold">Error:</strong> {error?.message}
      </div>
      <div>
        <Button onClick={() => reset()}>Try Again</Button>
      </div>
    </div>
  );
}
