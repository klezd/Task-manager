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
  dataArr.map((d) => {
    const { data, method, origin } = d;
    // Check version if request can be called
    if (method.match(/put|patch/g)) {
      if (data.version === origin.version) {
        const request = api({
          url: `/tasks/${data.id}/`,
          method,
          data,
        });
        return requestArr.push(request);
      }
    } else if (method === "delete") {
      if (data.version === origin.version) {
        const request = api({
          url: `/tasks/${data.id}/`,
          method,
        });
        return requestArr.push(request);
      }
    } else if (method === "post") {
      const request = api({
        url: `/tasks/`,
        method,
        data,
      });
    }
    return null;
  });
  return requestArr;
};