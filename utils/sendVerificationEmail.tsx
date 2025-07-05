import { AppContext, appContext } from '@/types/appContext';

// App Context
const appUrl: string = appContext.appUrl + '/api/sendVerificationEmail';

export const sendVerificationEmail = async (data) =>
  fetch(appUrl, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // authorization: `bearer ${session?.user?.accessToken}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error('Failed to send verification email');
    return res.json();
  });
