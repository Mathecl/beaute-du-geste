'use client';

import React from 'react';
import { useState, useEffect } from 'react';

import { AppContext, appContext } from '@/types/appContext';
import { Skeleton } from 'primereact/skeleton';

import Post from '@/ui/uniblog/Post';

interface Post {
  title: string;
  description: string;
  author: string;
  date: string;
  type: string;
}

export default function Uniblog() {
  // App context
  const getBlogPostsUrl: string = appContext.appUrl + '/api/blog/getBlogPosts';

  // Blog posts
  const [posts, setPosts] = useState<Post[]>([]); // Initialize posts state with an empty array
  const [loading, setLoading] = useState(true); // Add a loading state to indicate when data is being fetched

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(getBlogPostsUrl, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          method: 'GET',
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        // Check if data.posts is defined before setting posts
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data);
        } else {
          console.error('No valid posts found in data:', data);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div style={{ padding: '1.75rem' }}>
      <section>
        <div className="mx-auto max-w-screen-xl px-2 py-2 lg:px-4 lg:py-4">
          <div className="mx-auto mb-8 max-w-screen-sm text-center lg:mb-16">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white lg:text-4xl">
              Uniblog
            </h2>
            <p className="font-light text-gray-500 dark:text-gray-400 sm:text-xl">
              Retrouvez tous les posts du blog de Unigate, dont notamment des
              articles et des tutoriels
            </p>
          </div>
          <section>
            {/* Render loading skeleton or actual content based on loading state */}
            {loading ? (
              <>
                <Skeleton
                  width="98%"
                  height="305px"
                  className="mb-4"
                ></Skeleton>
                <Skeleton
                  width="98%"
                  height="305px"
                  className="mb-4"
                ></Skeleton>
              </>
            ) : (
              <div className="mx-auto max-w-screen-xl px-2 py-2 lg:px-4 lg:py-4">
                {/* Render posts */}
                {/* Ensure to check if posts array is not empty before mapping */}
                {posts ? (
                  <ul>
                    {posts.map((post, index) => (
                      <Post
                        key={index}
                        title={post.Post.title}
                        description={post.Post.description}
                        author={post.Post.author}
                        date={post.Post.date}
                        type={post.Post.type}
                        likeAmnt={post.Like.participants.length}
                      />
                    ))}
                  </ul>
                ) : (
                  <p>No posts available</p> // Render a message if no posts are available
                )}
              </div>
            )}
          </section>
          <div className="grid gap-8 lg:grid-cols-2"></div>
        </div>
      </section>
    </div>
  );
}
