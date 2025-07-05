export const postTranscriptionData = async (url, data, headers) =>
  fetch(url, {
    method: 'POST',
    body: data, // JSON.stringify(data)
    headers: headers,
  })
    .then((res) => {
      console.log(res);
      if (!res.ok) {
        throw new Error('Failed to transcript data');
      }
      return res.json();
    })
    .catch((error) => {
      console.error(error);
    });
