// ofe: Open for edit.
export const host = 'http://webdict.localhost:5000';
// https://webdict.ngolin.com/
export default (path: string, data?: any) =>
  fetch(host + path, formdata(data) as any)
    .then((res: Response) => {
      if (res.ok) return res.json();
      throw res.statusText;
    });

const formdata = data => data
  ? ({
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    credentials: 'include',
    method: 'POST',
    mode: 'cors',
  }) : ({
    credentials: 'include',
    method: 'GET',
    mode: 'cors'
  });
