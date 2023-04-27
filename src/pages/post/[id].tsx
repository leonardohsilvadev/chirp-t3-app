import { type NextPage } from "next";
import Head from "next/head";


const SinglePostPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex justify-center h-screen">
        <div>Post View</div>
      </main>
    </>
  );
};

export default SinglePostPage;
