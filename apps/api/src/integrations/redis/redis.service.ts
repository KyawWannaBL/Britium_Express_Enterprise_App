import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, RedisClientType } from "redis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClientType;
  private subscriber: RedisClientType;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.getOrThrow<string>("REDIS_URL");
    this.client = createClient({ url });
    this.subscriber = createClient({ url });
    this.client.on("error", (e) => console.error("Redis client error", e));
    this.subscriber.on("error", (e) => console.error("Redis subscriber error", e));
  }

  async getClient() { if (!this.client.isOpen) await this.client.connect(); return this.client; }
  async getSubscriber() { if (!this.subscriber.isOpen) await this.subscriber.connect(); return this.subscriber; }
  async publish(channel: string, payload: unknown) {
    const client = await this.getClient();
    await client.publish(channel, JSON.stringify(payload));
  }
  async setJson(key: string, value: unknown, ttlSeconds?: number) {
    const client = await this.getClient();
    const serialized = JSON.stringify(value);
    if (ttlSeconds) { await client.set(key, serialized, { EX: ttlSeconds }); return; }
    await client.set(key, serialized);
  }
  async getJson<T>(key: string): Promise<T | null> {
    const client = await this.getClient();
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) as T : null;
  }
  async onModuleDestroy() {
    if (this.client.isOpen) await this.client.quit();
    if (this.subscriber.isOpen) await this.subscriber.quit();
  }
}
