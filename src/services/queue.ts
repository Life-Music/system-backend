/* eslint-disable @typescript-eslint/no-explicit-any */
import kue from "kue";
import webPush from "web-push";
import "@src/pre-start";
import { Thumbnail, Prisma } from "~/prisma/generated/mysql";
import EnvVars from "@src/constants/EnvVars";

const queue = kue.createQueue({
  redis: EnvVars.Redis.Uri,
});
webPush.setGCMAPIKey("AIzaSyClBqHl-BDshqFgQCuMX5Hif7onQQmOw9I");
webPush.setVapidDetails(
  "mailto:admin@lifemusic.net",
  EnvVars.WebPush.PublicKey,
  EnvVars.WebPush.PrivateKey
);

const getThumbnailUrlPrimary = (
  thumbnails: Thumbnail[],
  id?: string
): string => {
  const primary = thumbnails.find(
    (thumbnail) => (id && thumbnail.id === id) || (!id && thumbnail.isPrimary)
  );
  return primary?.url ?? "/images/audio/default.png";
};

queue.process("delete_subscription", (job: any, done: () => void) => {
  globalThis.prisma.notificationSubscriptions.delete({
    where: {
      id: job.data,
    },
  });
  done();
});

queue.process("new_media", async (job: any, done: () => void) => {
  const media = job.data as Prisma.MediaGetPayload<{
    include: {
      thumbnails: true;
      owner: true;
    };
  }>;
  const users = await globalThis.prisma.subscriber.findMany({
    where: {
      channelId: media.userId,
      user: {
        NotificationSubscriptions: {
          some: {},
        },
      },
    },
    select: {
      user: {
        select: {
          NotificationSubscriptions: true,
        },
      },
    },
  });

  for (const user of users) {
    for (const sup of user.user.NotificationSubscriptions) {
      const subscriptionToken = sup.subscription;
      const data = {
        title: media.title,
        msg: `${media.owner.firstName} ${media.owner.lastName}`,
        image: getThumbnailUrlPrimary(media.thumbnails),
      };
      await webPush
        .sendNotification(JSON.parse(subscriptionToken), JSON.stringify(data))
        .catch((e) => {
          if (e.statusCode === 410) {
            queue.create("delete_subscription", sup.id).save();
          }
        });
    }
  }

  done();
});

export default queue;
