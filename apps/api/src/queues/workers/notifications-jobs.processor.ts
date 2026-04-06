import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";

@Processor("notifications")
export class NotificationsJobsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsJobsProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing notification job ${job.id}`);
    return {
      ok: true,
      type: job.name,
      payload: job.data,
    };
  }
}
