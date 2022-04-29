import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import * as Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom';

import { GetPrismicClient } from '../../services/prismic';

import styles from './styles.module.scss';
import { useSession } from 'next-auth/react';

type Post = {
    slug: string;
    title: string;
    excerpt: string;
    updatedAt: string;
}

interface PostsProps {
    posts: Post[]
}

export default function Posts({ posts }: PostsProps) {
    const {data: session} = useSession();
    
    return (
        <>
            <Head>
                <title>Posts | Ignews</title>
            </Head>

            <main className={styles.container}>
                <div className={styles.posts}>
                    {posts.map(post => (
                        <Link href={session?.activeSubscription ? (
                            `/posts/${post.slug}`
                        ) : (
                            `/posts/previews/${post.slug}`
                        )}>
                            <a key={post.slug}>
                            <time>{post.updatedAt}</time>
                            <strong>{post.title}</strong>
                            <p>{post.excerpt}</p>
                            </a>
                        </Link>
                    ))}
                </div>
            </main>
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const prismic = GetPrismicClient();

    const response = await prismic.get({
        predicates: Prismic.predicate.at('document.type', 'posts'),
        fetch: ['posts.title', 'posts.Content'],
        pageSize: 100,

    })

    const posts = response.results.map(post => {
        return {
            slug: post.uid,
            title: RichText.asText(post.data.title),
            excerpt: post.data.Content.find(content => content.type === 'paragraph')?.text ?? '',
            updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            })
        }
    })

    return {
        props: { posts }
    }
}