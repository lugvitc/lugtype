import { Controller, Get, Post } from "@nestjs/common";
import { PickType } from "@nestjs/mapped-types";

import { SharedTypes } from "shared-types/types";

class CreateUserDto extends PickType(SharedTypes.User, [
  "email",
  "name",
  "uid",
] as const) {}

@Controller("/users")
export class UserController {
  constructor() {}

  @Post("/signup")
  async signup(): Promise<SharedTypes.User> {}

  @Get()
  async getUser(): Promise<string> {
    return "hello";
  }
}
