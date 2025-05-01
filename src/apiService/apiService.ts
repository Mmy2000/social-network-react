import { useUser } from "@/context/UserContext";
const API_HOST = import.meta.env.VITE_API_HOST as string;



const apiService = {
    get: async function (url: string, token?: string): Promise<any> {
        console.log('get', url);

        console.log("Access Token:", token);

        return fetch(`${API_HOST}${url}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(json => {
            console.log('Response:', json);
            return json;
        })
        .catch(error => {
            throw error;
        });
    },
    getWithoutToken: async function (url: string): Promise<any> {
        console.log('getWithoutToken', url);

        return new Promise((resolve, reject) => {
            fetch(`${API_HOST}${url}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then((json) => {
                    console.log('Response:', json);

                    resolve(json);
                })
                .catch((error => {
                    reject(error);
                }))
        })
    },
    post: async function(url: string, data?: any, token?: string): Promise<any> {
        console.log('post', url, data);

        return new Promise((resolve, reject) => {
            fetch(`${API_HOST}${url}`, {
            method: 'POST',
            body: data ? JSON.stringify(data) : null,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            }
            })
            .then(response => response.json())
            .then((json) => {
                console.log('Response:', json);
                resolve(json);
            })
            .catch((error) => {
                reject(error);
            });
        });
    },
    put: async function(url: string, data?: any): Promise<any> {
        console.log('put', url, data);
    },
    delete: async function(url: string, data?: any): Promise<any> {
        console.log('delete', url, data);
    },
    postWithoutToken: async function(url: string, data: any): Promise<any> {
        console.log('postWithoutToken', url, data);
        return new Promise((resolve, reject) => {
            fetch(`${API_HOST}${url}`, {
                method: 'POST',
                body: data,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then((json) => {
                console.log('Response:', json);
                resolve(json);
            })
            .catch((error) => {
                reject(error);
            })
        });
    }
}

export default apiService;
