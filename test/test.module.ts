import { Module } from "@nestjs/common";
import { TestService } from "./test.service";
import { OrderService } from "../src/order/order.service";

@Module({
  providers: [TestService, OrderService]
})
export class TestModule {}