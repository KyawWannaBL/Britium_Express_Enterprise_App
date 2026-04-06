import { Module } from "@nestjs/common";
import { TamperTagsController } from "./tamper-tags.controller";
import { TamperTagsService } from "./tamper-tags.service";

@Module({
  controllers: [TamperTagsController],
  providers: [TamperTagsService],
  exports: [TamperTagsService],
})
export class TamperTagsModule {}
