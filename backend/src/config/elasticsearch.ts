import { Client } from '@elastic/elasticsearch';
import logger from '../middlewares/logger';

let elasticsearchClient: Client | undefined;

export const getElasticsearchClient = (): Client => {
  if (!elasticsearchClient) {
    const elasticsearchConfig: any = {
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    };

    if (process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD) {
      elasticsearchConfig.auth = {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD,
      };
    }

    elasticsearchClient = new Client(elasticsearchConfig);

    // Test connection
    elasticsearchClient.ping()
      .then(() => {
        logger.info('Elasticsearch connection established', {
          node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200'
        });
      })
      .catch((error) => {
        logger.error('Elasticsearch connection failed', {
          error: error.message,
          node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200'
        });
      });
  }

  return elasticsearchClient;
};

export const connectElasticsearch = async (): Promise<void> => {
  try {
    const client = getElasticsearchClient();
    await client.ping();
    logger.info('Elasticsearch connection verified');
  } catch (error: any) {
    logger.error('Failed to connect to Elasticsearch', {
      error: error.message,
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200'
    });
    throw error;
  }
};

export const disconnectElasticsearch = async (): Promise<void> => {
  try {
    const client = getElasticsearchClient();
    await client.close();
    logger.info('Elasticsearch connection closed');
  } catch (error: any) {
    logger.error('Failed to disconnect from Elasticsearch', {
      error: error.message
    });
    throw error;
  }
};

// Index names
export const INDEXES = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  VENDORS: 'vendors',
  SEARCH_SUGGESTIONS: 'search_suggestions',
} as const;

export default elasticsearchClient;