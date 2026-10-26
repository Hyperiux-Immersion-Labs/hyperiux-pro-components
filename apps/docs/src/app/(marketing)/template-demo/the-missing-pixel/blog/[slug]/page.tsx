// Built using Hyperiux Vault: https://vault.hyperiux.com
import { notFound } from "next/navigation";
import { pageMetadata } from "../../metadata";
import PostBody from "../../components/blog/PostBody";
import PostHero from "../../components/blog/PostHero";
import ReadingProgress from "../../components/blog/ReadingProgress";
import { ALL_POSTS } from "../../components/blog/posts";

type PageProps = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => ALL_POSTS.map((post) => ({ slug: post.slug }));

export const generateMetadata = async ({ params }: PageProps) => {
  const { slug } = await params;
  const post = ALL_POSTS.find((item) => item.slug === slug);
  if (!post) return {};
  return pageMetadata(`${post.title} | The Missing Pixel`, post.excerpt, `/blog/${slug}`);
};

const page = async ({ params }: PageProps) => {
  const { slug } = await params;
  const post = ALL_POSTS.find((item) => item.slug === slug);
  if (!post) notFound();

  return (
    <>
      <ReadingProgress targetId="article-body" />
      <PostHero post={post} />
      <PostBody post={post} />
    </>
  );
};

export default page;
