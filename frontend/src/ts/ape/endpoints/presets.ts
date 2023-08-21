const BASE_PATH = "/presets";

export default class Presets {
  constructor(private httpClient: Ape.HttpClient) {
    this.httpClient = httpClient;
  }

  async get(): Ape.Endpoint {
    return await this.httpClient.get(BASE_PATH);
  }

  async add(
    presetName: string,
    configChanges: MonkeyTypes.ConfigChanges
  ): Ape.Endpoint {
    const payload = {
      name: presetName,
      config: configChanges,
    };

    return await this.httpClient.post(BASE_PATH, { payload });
  }

  async edit(
    presetId: string,
    presetName: string,
    configChanges: MonkeyTypes.ConfigChanges
  ): Ape.Endpoint {
    const payload = {
      _id: presetId,
      name: presetName,
      config: configChanges,
    };

    return await this.httpClient.patch(BASE_PATH, { payload });
  }

  async delete(presetId: string): Ape.Endpoint {
    return await this.httpClient.delete(`${BASE_PATH}/${presetId}`);
  }
}
