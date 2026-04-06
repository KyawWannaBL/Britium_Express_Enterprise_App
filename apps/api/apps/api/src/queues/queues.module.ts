import { Global, Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";
import { LabelJobsProcessor } from "./workers/label-jobs.processor";
import { NotificationsJobsProcessor } from "./workers/notifications-jobs.processor";
import { QueuePublisherService } from "./queue-publisher.service";

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.getOrThrow<string>("REDIS_URL");
        const url = new URL(redisUrl);

        return {
          connection: {
            host: url.hostname,
            port: Number(url.port || 6379),
            password: url.password || undefined,
          },
        };
      },
    }),
    BullModule.registerQueue(
      { name: "labels" },
      { name: "notifications" },
      { name: "imports" },
    ),
  ],
  providers: [
    QueuePublisherService,
    LabelJobsProcessor,
    NotificationsJobsProcessor,
  ],
  exports: [QueuePublisherService, BullModule],
})
export class QueuesModule {}
