export async function getIngestInfo(ingestInfoUrl, series, visibility) {
  const code = series.key;
  const title = series.value;
  const visibile = visibility.key;

  const url = ingestInfoUrl + '?code=' + encodeURIComponent(code) + '&title=' +
    encodeURIComponent(title) + '&visibility=' + encodeURIComponent(visibile);

  const response = await fetch(url, {
    credentials: 'same-origin',
    redirect: 'manual',
  });
  return await response.json();
}

export function isCourseId(orgId) {
  const re = /^I[0-9]{4}-(\w|\W)+/;
  return re.test(orgId);
}

export async function db_addVideoDetails(mediapackage, workflow, uploadSettings) {
  const title = trimString(uploadSettings.metaData.title);
  const typeId = uploadSettings.ingestInfo.series.typeId;
  const mpId = getAttrib(mediapackage, 'mediapackage', 'id');
  const workflowId = getAttrib(workflow, 'wf:workflow', 'id');
  const org = uploadSettings.metaData.series.key;
  const visibileType = uploadSettings.metaData.visibility.key;

  // sql datetime of upload
  let start = getAttrib(mediapackage, 'mediapackage', 'start');;
  const regex = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})Z/;
  start = start.replace(regex, '$1 $2');

  const body = new FormData();
  body.append('title', title);
  body.append('typeId', typeId);
  body.append('mpId', mpId);
  body.append('workflowId', workflowId);
  body.append('org', org);
  body.append('start', start);
  body.append('visibleType', visibileType);

  let retval = {};
  try {
    const response = await fetch(uploadSettings.ingestCallbackUrl, {
      credentials: 'same-origin',
      redirect: 'manual',
      body: body,
      method: 'post',
    });
    retval =  await response.json();
  }
  catch(err) {
    console.warn('Unable to insert upload details into database', err);
  }
  return retval;
}

const trimString = (str, len = 100) => {
  return str.length > len ?
    str.substring(0, len) + '...' :
    str;
}

const getAttrib = (doc, tag, attrib) => {
  const dp = new DOMParser();
  const xml = dp.parseFromString(doc, 'text/xml');
  return xml.getElementsByTagName(tag)[0].attributes[attrib].value;
}
