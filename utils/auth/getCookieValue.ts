import { cookies } from 'next/headers';
//nextjs.org/docs/app/api-reference/functions/cookies

export default function getCookieValue(cookieName: string) {
  const cookieStore = cookies();
  const cookieValue = cookieStore.get(cookieName);
  // console.log('test:' + JSON.stringify(cookieValue));
  return cookieValue;
}
