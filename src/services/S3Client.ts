import { S3Client } from '@aws-sdk/client-s3';
import EnvVars from '@src/constants/EnvVars';

const client = new S3Client({
  region: 'ap-southeast-1',
  credentials: {
    accessKeyId: EnvVars.AWS.AccessKeyId,
    secretAccessKey: EnvVars.AWS.SecretAccessKey,
  },
});

export default client;