import axios from "axios";

export const api = axios.create({
  baseURL: "https://mobal-challenge.herokuapp.com",
  auth: {
    username: "tester",
    password: "3kq5pVJxV6nVB5W",
  },
});

export const prepareRequests = (dataArr) => {
  const requestArr = [];
  if (dataArr.length === 0) return;
  dataArr.map((d) => {
    if (!d) return null;

    const { data, method, origin } = d;
    // Check version if request can be called
    if (!origin && method !== "post") return null;

    if (method === "post") {
      const request = api({
        url: `/tasks/`,
        method,
        data,
      });
      return requestArr.push(request);
    }

    // TODO Recheck with origin on App.js
    // if (data.version === origin.version) {
    if (method.match(/put|patch/g)) {
      const request = api({
        url: `/tasks/${data.id}/`,
        method,
        data,
      });
      return requestArr.push(request);
    } else if (method === "delete") {
      const request = api({
        url: `/tasks/${data.id}/`,
        method,
      });
      return requestArr.push(request);
    }
    // }

    return null;
  });
  return requestArr;
};