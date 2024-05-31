import { initClient } from "@ts-rest/core";
import { GetUserType, userContract } from "../../contract-temp/user.contract";
import { getAuthenticatedUser, isAuthenticated } from "../../firebase";
import { getIdToken } from "firebase/auth";
import { Axios, AxiosError, AxiosResponse, Method, isAxiosError } from "axios";

export default class Users {
  private client;

  constructor(baseUrl: string, axios: Axios) {
    this.client = initClient(userContract, {
      baseUrl,
      jsonQuery: true,
      api: async ({ path, method, headers, body }) => {
        console.log("####", { path, method, headers, body });
        const token = isAuthenticated()
          ? await getIdToken(getAuthenticatedUser())
          : "";
        try {
          const result = await axios.request({
            method: method as Method,
            url: path,
            headers: {
              ...headers,
              Authorization: `Bearer ${token}`,
            },
            data: body,
          });
          return {
            status: result.status,
            body: result.data,
            headers: result.headers,
          };
        } catch (e: Error | AxiosError | any) {
          if (isAxiosError(e)) {
            const error = e as AxiosError;
            const response = error.response as AxiosResponse;
            return {
              status: response.status,
              body: response.data,
              headers: response.headers,
            };
          }
          throw e;
        }
      },
    });
  }

  async getData(): Promise<GetUserType> {
    return (await this.client.get()).body;
  }
}
