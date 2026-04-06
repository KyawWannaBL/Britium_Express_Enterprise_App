import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";

@Processor("labels")
export class LabelJobsProcessor extends WorkerHost {
  private readonly logger = new Logger(LabelJobsProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing label job ${job.id}`);
    return {
      ok: true,
      type: job.name,
      payload: job.data,
    };
  }
}
