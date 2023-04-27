import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { appRouter } from "~/server/api/root";
import { prisma } from '~/server/db';
import superjson from "superjson";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { PageLayout } from "~/components";

const ProfilePage: NextPage<{username: string}> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username });

  if (!data) return <div>404</div>

  console.log(username);

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div>{data.username}</div>
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
