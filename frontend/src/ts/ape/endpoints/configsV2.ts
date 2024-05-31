import { initClient } from "@ts-rest/core";
import {
  GetConfig,
  configContract,
} from "./../../../../../shared/contract/config.contract";
import { getAuthenticatedUser, isAuthenticated } from "../../firebase";
import { getIdToken } from "firebase/auth";
import { Axios, AxiosError, AxiosResponse, Method, isAxiosError } from "axios";

export default class Users {
  private client;

  constructor(baseUrl: string, axios: Axios) {
    this.client = initClient(configContract, {
      baseUrl,
      jsonQuery: true,
      //TODO extract
      api: async ({ path, method, headers, body }) => {
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
        } catch (e: Error | AxiosError | unknown) {
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

  async get(): Promise<GetConfig> {
    return (await this.client.get()).body;
  }

  getClient() {
    return this.client;
  }
}
