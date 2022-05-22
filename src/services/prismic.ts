import * as prismic from '@prismicio/client';
import { HttpRequestLike } from '@prismicio/client';
import { enableAutoPreviews } from '@prismicio/next';

export interface PrismicConfig {
  req?: HttpRequestLike;
}

export const repositoryName = process.env.PRISMIC_API_ENDPOINT;

export function getPrismicClient(config: PrismicConfig): prismic.Client {
  const client = prismic.createClient(repositoryName);

  enableAutoPreviews({
    client,
    req: config.req,
  })

  return client;
}
