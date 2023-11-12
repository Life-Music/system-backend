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
    Email: (process.env.ONEDRIVE_EMAIL ?? ""),
    Password: (process.env.ONEDRIVE_PASSWORD ?? ""),
    FolderRoot: (process.env.ONEDRIVE_FOLDER_ROOT ?? ""),
    ClientId: (process.env.ONEDRIVE_CLIENT_ID ?? ""),
  }
} as const;
