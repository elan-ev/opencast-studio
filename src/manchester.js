export async function getSeries(seriesUrl, code, title) {

  const url = seriesUrl + '?code=' + encodeURIComponent(code) + '&title=' + encodeURIComponent(title);

  const response = await fetch(url, {
    credentials: 'same-origin',
    redirect: 'manual',
  });
  return await response.json();
}