/**
 * Environments variables declared here.
 */

/* eslint-disable node/no-process-env */


export default {
  NodeEnv: (process.env.NODE_ENV ?? ''),
  Port: (process.env.PORT ?? 0),
  Jwt: {
    Secret: (process.env.JWT_SECRET ?? ''),
    Exp: (process.env.COOKIE_EXP ?? ''), // exp at the same time as the cookie
  },
  OneDrive: {
    Email: (process.env.ONEDRIVE_EMAIL ?? ''),
    Password: (process.env.ONEDRIVE_PASSWORD ?? ''),
    FolderRoot: (process.env.ONEDRIVE_FOLDER_ROOT ?? ''),
    ClientId: (process.env.ONEDRIVE_CLIENT_ID ?? ''),
  },
  Jenkins: {
    Username: (process.env.JENKINS_USERNAME ?? ''),
    ApiKey: (process.env.JENKINS_API_KEY ?? ''),
    ProcessAudioEndPoint: (process.env.JENKINS_PROCESS_AUDIO_ENDPOINT ?? ''),
  },
  Redis: {
    Uri: (process.env.REDIS_URI ?? ''),
  },
  ElasticSearch: {
    Endpoint: (process.env.ELASTIC_SEARCH_ENDPOINT ?? ''),
    Username: (process.env.ELASTIC_SEARCH_USERNAME ?? ''),
    Password: (process.env.ELASTIC_SEARCH_PASSWORD ?? ''),
  },
  AWS: {
    AccessKeyId: (process.env.AWS_ACCESS_KEY ?? ''),
    SecretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY ?? ''),
    BucketImage: (process.env.AWS_BUCKET_IMAGE ?? ''),
    ObjectUrl: (process.env.AWS_OBJECT_URL ?? ''),
  },
  WebPush: {
    PublicKey: (process.env.WEBPUSH_PUBLIC_KEY ?? ''),
    PrivateKey: (process.env.WEBPUSH_PRIVATE_KEY ?? ''),
  },
  Google: {
    ClientId: (process.env.GOOGLE_CLIENT_ID ?? ''),
    ClientSecret: (process.env.GOOGLE_CLIENT_SECRET ?? ''),
    RedirectUri: (process.env.GOOGLE_REDIRECT_URI ?? ''),
  },
} as const;
