import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { INestApplication } from "@nestjs/common";

async function buildApp(): Promise<INestApplication> {
  return await NestFactory.create(AppModule);
}

export default buildApp;
