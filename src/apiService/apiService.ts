import axios from "axios";

const API_HOST = import.meta.env.VITE_API_HOST as string;

const apiService = {
  get: async function (url: string, token?: string): Promise<any> {
    console.log("get", url);
    console.log("Access Token:", token);

    try {
      const response = await axios.get(`${API_HOST}${url}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      console.log("Response:", response.data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  getWithoutToken: async function (url: string): Promise<any> {
    console.log("getWithoutToken", url);
    try {
      const response = await axios.get(`${API_HOST}${url}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      console.log("Response:", response.data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  post: async function (url: string, data?: any, token?: string): Promise<any> {
    console.log("post", url, data);
    try {
      const response = await axios.post(`${API_HOST}${url}`, data ?? {}, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      console.log("Response:", response.data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  postNewPost: async function (
    url: string,
    data?: any,
    token?: string
  ): Promise<any> {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

    try {
      const response = await axios.post(`${API_HOST}${url}`, data, {
        headers: {
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(data && !isFormData && { "Content-Type": "application/json" }),
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  put: async function (url: string, data?: any, token?: string): Promise<any> {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

    try {
      const response = await axios.put(`${API_HOST}${url}`, data, {
        headers: {
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          // Remove Content-Type for FormData to let browser set it automatically
          // with the correct boundary parameter
          ...(data && !isFormData && { "Content-Type": "application/json" }),
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  delete: async function (url: string, token?: string): Promise<any> {
    try {
      const response = await axios.delete(`${API_HOST}${url}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  postWithoutToken: async function (url: string, data: any): Promise<any> {
    console.log("postWithoutToken", url, data);
    try {
      const response = await axios.post(`${API_HOST}${url}`, data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      console.log("Response:", response.data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};

export default apiService;
