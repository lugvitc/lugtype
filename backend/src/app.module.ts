import { Module } from "@nestjs/common";
import { UserController } from "./api/nestControllers/user.controller";

@Module({
  imports: [],
  controllers: [UserController],
  providers: [],
})
export class AppModule {}
