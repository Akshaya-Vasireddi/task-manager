import axios from "axios";

const API = axios.create({
  baseURL: "https://task-manager-2-t44r.onrender.com/api/tasks",
});

export default API;
