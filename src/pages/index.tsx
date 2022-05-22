import { Console } from 'console';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { Header } from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  console.log(posts);

  async function nextPageHandler() {
    const newPosts = [...posts];
    if (nextPage === null) {
      return;
    }

    const nextPageResponse = await fetch(nextPage).then(response =>
      response.json()
    );

    const postNextPage = nextPageResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });
    const newNextPage = nextPageResponse.next_page;

    newPosts.push(...postNextPage);
    setPosts(newPosts);
    setNextPage(newNextPage);
  }

  return (
    <>
      <Head>
        <title>Spacetraveling</title>
      </Head>
      <Header />

      <main className={styles.container}>
        {posts.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a>
              <strong>{post.data.title}</strong>

              <p>{post.data.subtitle}</p>

              <div>
                <div>
                  <FiCalendar className={styles.calendar} />
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                </div>

                <div>
                  <FiUser className={styles.calendar} />
                  <p>{post.data.author}</p>
                </div>
              </div>
            </a>
          </Link>
        ))}

        {nextPage !== null ? (
          <a className={styles.pagination} onClick={nextPageHandler}>
            Carregar mais posts{' '}
          </a>
        ) : null}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByType('publication', {
    pageSize: 2,
    orderings: {
      field: 'document.first_publication_date',
      direction: 'desc',
    },
  });

  const posts = response.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: response.next_page ? response.next_page : null,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
    revalidate: 10,
  };
};
