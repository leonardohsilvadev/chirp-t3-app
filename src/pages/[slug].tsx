import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { appRouter } from "~/server/api/root";
import { prisma } from '~/server/db';
import superjson from "superjson";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { Loader, PageLayout, PostView } from "~/components";
import Image from "next/image";

const ProfileFeed = ({ userId }: { userId: string; }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({ userId });

  if (isLoading) return <Loader />;

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map(post => (
        <PostView key={post.post.id} {...post} />
      ))}
    </div>
  )
}

const ProfilePage: NextPage<{username: string}> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username });

  if (!data) return <div>404</div>

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <Image
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
            src={data.profileImageUrl}
            alt={`${data.username ?? ""}'s profile pic`}
            width={128}
            height={128}
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${data.username ?? ''}`}</div>
        <div className="border-b border-slate-400 w-full" />
        <ProfileFeed userId={data.id}/>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });

  const slug = context.params?.slug;

  
  if (typeof slug !== "string") throw new Error("No slug");
  
  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username
    }
  }
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
}

export default ProfilePage;
