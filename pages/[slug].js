import { createClient } from 'contentful';
import Head from 'next/head';
import Image from 'next/image';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import styles from '../styles/Slug.module.css';
import FetchData from '../components/FetchData';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_DELIVERY_API,
});

// generate static page for each data from slug
export const getStaticPaths = async () => {
  const res = await client.getEntries({
    content_type: 'project',
  });

  const paths = res.items.map((item) => {
    return {
      params: { slug: item.fields.slug },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

// fetch single items based on the page we're on and inject it as a prop
export const getStaticProps = async ({ params }) => {
  const { items } = await client.getEntries({
    content_type: 'project',
    'fields.slug': params.slug, // match the items we want
  });

  // conditional redirect
  if (!items.length) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // pass the single items object
  return {
    props: { project: items[0] },
    revalidate: 1, // in seconds for page re-generation
  };
};

export default function ProjectDetails({ project }) {
  if (!project) return <FetchData />;

  const { thumbnail, title, description, tags, slug, details } = project.fields;

  const { width, height } = thumbnail.fields.file.details.image;

  return (
    <>
      <Head>
        <title>{title} • Next Portfolio</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <div className={styles.banner}>
          <Image src={'https:' + thumbnail.fields.file.url} width={width} height={height} />
        </div>
        <div className={styles.content}>
          <h2>{title}</h2>
          <p>{description}</p>

          {tags.map((tag) => (
            <span key={tag} className={styles.hashtag}>
              {tag}
            </span>
          ))}
          <hr />
        </div>

        <div className={styles.details}>{documentToReactComponents(details)}</div>

        <div className={styles.back__button}>
          <a href="/">&larr; Back to Home</a>
        </div>
      </div>
    </>
  );
}
