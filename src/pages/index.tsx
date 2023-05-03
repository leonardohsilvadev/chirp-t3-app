import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { api } from "~/utils/api";

import Image from "next/image";
import { Loader, LoadingSpinner, PageLayout, PostView } from "~/components";
import { useState } from "react";
import { toast } from "react-hot-toast";

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState('');

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    }
  });

  if (!user) return null;

  return (
    <div className="flex gap-4 w-full">
      <Image
        src={user.profileImageUrl}
        alt="Profile Image"
        className="w-14 h-14 rounded-full"
        width="56"
        height="56"
      />
      <input
        className="bg-transparent grow outline-none"
        placeholder="Type some emojis!"
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button onClick={() => mutate({ content: input })}>Post</button>
      )}
      {isPosting && (
        <div className="flex flex-col justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  )
}

const Feed = () => {
  const { data, isLoading: isPostsLoading } = api.posts.getAll.useQuery();

  if (isPostsLoading) return <Loader />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data?.map(((post) => (
        <PostView key={post.post.id} {...post} />
      )))}
    </div>
  )
}

const Home: NextPage = () => {
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();

  // Start fetching asap
  api.posts.getAll.useQuery();

  // Return empty div if user isn't loaded
  if (!isUserLoaded) return <div />

  return (
    <>
      <PageLayout>
        <div className="flex border-b border-slate-400 p-4">
          {!isSignedIn && (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}
          {!!isSignedIn && <CreatePostWizard />}
        </div>

        <Feed />
      </PageLayout>
    </>
  );
};

export default Home;
