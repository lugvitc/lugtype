import request from "supertest";
import server from "../../../app";

describe("user controller test", () => {
  it("should be able to sign up", (done) => {
    const newUser = {
      name: "Test",
      email: "mockemail@email.com",
      uid: "userId",
    };
    request(server)
      .post("/users/signup")
      .send(newUser)
      .set({
        Accept: "application/json",
        Authorization: "Bearer mockToken",
      })
      .expect(200, done);
  });
});
