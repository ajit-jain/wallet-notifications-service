import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.PORT || 3000,
  throttle: {
    limit: parseInt(process.env.NUMBER_OF_REQUESTS_ALLOWED_IN_TTL) || 10,
    ttl: parseInt(process.env.TIME_WINDOW_FOR_ACCEPTING_REQUESTS_IN_SECONDS) * 1000 || 60000,
  }
}));