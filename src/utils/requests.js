import axios from "axios";

export const api = axios.create({
  baseURL: "https://mobal-challenge.herokuapp.com/tasks",
  auth: {
    username: "tester",
    password: "3kq5pVJxV6nVB5W",
  },
});
