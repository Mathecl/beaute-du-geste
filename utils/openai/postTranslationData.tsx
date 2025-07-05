export const postTranslationData = async (url, prompt, bearer) =>
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      authorization: `Bearer ${bearer}`,
    },
    body: JSON.stringify(prompt),
  })
    .then((res) => {
      // console.log('Data translation response:' + JSON.stringify(res));
      if (!res.ok) {
        throw new Error('Failed to translate data');
      }
      return res.json();
    })
    .catch((error) => {
      console.error('Error occured when translating data:' + error);
    });
