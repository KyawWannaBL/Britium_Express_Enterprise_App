import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class QueuePublisherService {
  constructor(
    @InjectQueue("labels") private readonly labelsQueue: Queue,
    @InjectQueue("notifications") private readonly notificationsQueue: Queue,
    @InjectQueue("imports") private readonly importsQueue: Queue,
  ) {}

  enqueueLabelGeneration(payload: unknown) {
    return this.labelsQueue.add("generate-label", payload);
  }

  enqueueNotification(payload: unknown) {
    return this.notificationsQueue.add("send-notification", payload);
  }

  enqueueImportProcessing(payload: unknown) {
    return this.importsQueue.add("process-import", payload);
  }
}
