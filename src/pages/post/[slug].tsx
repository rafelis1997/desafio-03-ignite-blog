import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RichText } from 'prismic-dom';
import Head from 'next/head';
import { Header } from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

type Post = {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
};

interface PostProps {
  posts: Post;
}

export default function Post({ posts }: PostProps): JSX.Element {
  const newPost = posts;
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  let fullText = '';
  const readWordsTime = 200;

  newPost.data.content.forEach(postContent => {
    fullText += postContent.heading;
    fullText += RichText.asText(postContent.body);
  });

  const time = Math.ceil(fullText.split(/\s/g).length / readWordsTime);

  return (
    <>
      <Head>
        <title>{newPost.data.title} | Spacetraveling</title>
      </Head>
      <Header />
      <img className={styles.banner} src={newPost.data.banner.url} alt="" />
      <main className={styles.container}>
        <h1>{newPost.data.title}</h1>
        <div className={styles.info}>
          <FiCalendar className={styles.calendar} />
          <time>
            {format(new Date(newPost.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </time>
          <FiUser className={styles.calendar} />
          <p>{newPost.data.author}</p>
          <FiClock className={styles.clock} />
          <p>{time} min.</p>
        </div>
        <article>
          {newPost.data.content.map(conten => {
            return (
              <>
                <h1>{conten.heading}</h1>
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(conten.body),
                  }}
                />
              </>
            );
          })}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByType('publication', {
    pageSize: 2,
    orderings: {
      field: 'document.first_publication_date',
      direction: 'desc',
    },
  });

  const paths = await response.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('publication', String(slug));

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      posts: post,
    },
  };
};
