'use client';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

import DOMPurify from 'dompurify';

import { Toast } from 'primereact/toast';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';

import { AppContext, appContext } from '@/types/appContext';
import { SkeletonCard } from '@/ui/SkeletonCard';
// import Comment from '@/ui/uniblog/Comment';

interface Post {
  title: string;
  description: string;
  author: string;
  date: string;
  type: string;
  content: string;
}
// interface Comment {
//   participant: string;
//   content: string;
// }

export default function Article() {
  // App context
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const getBlogPostUrl: string = appContext.appUrl + '/api/blog/getBlogPost';
  // const postCommentUrl: string = appContext.appUrl + '/api/blog/postComment';
  const postLikeUrl: string = appContext.appUrl + '/api/blog/postLike';

  // App notification
  const toast = useRef(null);
  const showSuccess = (message) => {
    toast.current.show({
      severity: 'success',
      summary: 'Succès',
      detail: message,
    });
  };
  const showError = (message) => {
    toast.current.show({
      severity: 'error',
      summary: 'Erreur',
      detail: message,
    });
  };

  // Router
  const params = useParams();

  // Blog post
  const [post, setPost] = useState<Post | null>(null); // Initialize post state with null
  const [htmlContent, setHtmlContent] = useState<string>('');

  // Blog comments
  // const [comments, setComments] = useState<Comment[]>([]); // Initialize comments state with an empty array
  const [userName, setUserName] = useState<string>('');
  // const [text, setText] = useState<string>('');

  // Blog likes
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
  const [hasUserAlreadyLiked, setHasUserAlreadyLiked] =
    useState<boolean>(false);
  const [postLikeAmnt, setPostLikeAmnt] = useState<number>(0);

  const [loading, setLoading] = useState(true); // Add a loading state to indicate when data is being fetched
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const jwtRes = await fetch(getJWTdataUrl, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          method: 'GET',
        });
        const jwtData = await jwtRes.json();

        if (jwtRes.ok) {
          setIsUserLoggedIn(true);
          setUserName(jwtData.userPrismaName);
        } else {
          setIsUserLoggedIn(false);
          setUserName('undefined');
        }

        const blogRes = await fetch(getBlogPostUrl, {
          body: JSON.stringify(params.article),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          method: 'POST',
        });
        const blogData = await blogRes.json();
        if (!blogRes.ok) {
          throw new Error('Failed to fetch posts');
        }

        // Check if blogData.posts is defined before setting posts
        if (blogData) {
          // Blog post
          setPost(blogData);
          setHtmlContent(blogData.Post.content);
          // Blog comments
          // setComments(blogData.Comment);
          // Blog likes
          setPostLikeAmnt(blogData.Like.participants.length);
          if (blogData.Like.participants.includes(jwtData.userPrismaName)) {
            setHasUserAlreadyLiked(true);
          } else {
            setHasUserAlreadyLiked(false);
          }
        } else {
          showError("Aucun post valide n'a été trouvé");
        }
      } catch (error) {
        showError(`Une erreur est survenue: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Sanitize HTML content
  const sanitizedHtmlContent = DOMPurify.sanitize(htmlContent);

  // Handle comments
  // const [commentSent, setCommentSent] = useState(true); // Add a loading state to indicate when data is being fetched

  // async function handleComment() {
  //   setCommentSent(true);

  //   if (text.length > 500) {
  //     showError(
  //       'La longueur du commentaire dépasse celle maximale autorisée de 500 caractères',
  //     );
  //   } else {
  //     const dataToVerify: string = `${params.article},${userName},${text}`;

  //     try {
  //       fetch(postCommentUrl, {
  //         body: JSON.stringify(dataToVerify),
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Accept: 'application/json',
  //           // authorization: `bearer ${session?.user?.accessToken}`,
  //         },
  //         method: 'POST',
  //       }).then(() => showSuccess('Commentaire envoyé avec succès'));
  //     } catch (error) {
  //       showError(`Le commentaire n'a pas pu être envoyé: ${error}`);
  //     }
  //   }

  //   setCommentSent(false);
  // }

  // Handle likes
  const [isLikesLoading, setIsLikesLoading] = useState<boolean>(false);

  async function handleLikes() {
    setIsLikesLoading(true);
    if (hasUserAlreadyLiked == true) {
      showError('Vous avez déjà aimé ce post');
    } else {
      const dataToVerify: string = `${params.article},${userName}`;

      try {
        fetch(postLikeUrl, {
          body: JSON.stringify(dataToVerify),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            // authorization: `bearer ${session?.user?.accessToken}`,
          },
          method: 'POST',
        }).then(() => {
          setPostLikeAmnt((prevLikes) => prevLikes + 1);
          setHasUserAlreadyLiked(true);
          showSuccess('Vous avez aimé ce post');
        });
      } catch (error) {
        showError(`Une erreur est survenue: ${error}`);
      }
    }
    setIsLikesLoading(false);
  }

  return (
    <div style={{ padding: '1.75rem' }}>
      <Toast ref={toast} />

      <main className="px-2 py-2 antialiased lg:px-4 lg:py-4">
        <div className="mx-auto max-w-screen-xl justify-between px-4">
          <article className="format format-sm sm:format-base lg:format-lg format-blue dark:format-invert mx-auto w-full max-w-2xl">
            {/* Render loading skeleton or actual content based on loading state */}
            {loading ? (
              <>
                <SkeletonCard />
              </>
            ) : (
              <div>
                <header className="not-format mb-4 lg:mb-6">
                  <address className="mb-6 flex items-center not-italic">
                    <div className="mr-3 inline-flex items-center text-sm text-gray-900 dark:text-white">
                      {/* <img className="mr-4 w-16 h-16 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-2.jpg" alt="Jese Leos"> */}
                      <div>
                        <a
                          href="#"
                          rel="author"
                          className="text-xl font-bold text-gray-900 dark:text-white"
                        >
                          {post.Post.author}
                        </a>
                        <p className="text-base text-gray-500 dark:text-gray-400">
                          {post.Post.date}
                        </p>
                        {/* <p className="text-base text-gray-500 dark:text-gray-400"> */}
                        {/* <time pubdate datetime="2022-02-08" title="February 8th, 2022">Feb. 8, 2022</time
                ></p> */}
                      </div>
                    </div>
                  </address>
                  <h1 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 dark:text-white lg:mb-6 lg:text-4xl">
                    {post.Post.title}
                  </h1>
                </header>
                <p className="lead">{post.Post.description}</p>
                <br />
                <br />
                <hr />
                <br />
                <br />
                <div
                  dangerouslySetInnerHTML={{ __html: sanitizedHtmlContent }}
                />
                <br />
                <br />
                <hr />
                <br />
                <br />

                <section>
                  <div className="justify-left mb-4 flex items-center">
                    {hasUserAlreadyLiked || !isUserLoggedIn ? (
                      <Button
                        icon="pi pi-thumbs-up"
                        rounded
                        text
                        aria-label="Aimer"
                        disabled
                      />
                    ) : (
                      <Button
                        icon="pi pi-thumbs-up"
                        rounded
                        text
                        aria-label="Aimer"
                        onClick={handleLikes}
                        loading={isLikesLoading}
                      />
                    )}
                    <span>{postLikeAmnt} personnes ont aimé</span>
                  </div>
                </section>

                {/* <section>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white lg:text-2xl">
                      Commentaires
                    </h2>
                  </div>
                  <div className="mb-6 items-center justify-between">
                    <InputTextarea
                      autoResize
                      value={text}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setText(e.target.value)
                      }
                      rows={5}
                      cols={30}
                      className="mb-2"
                      required
                    />
                    {commentSent ? (
                      <Button
                        label="Envoyer"
                        outlined
                        rounded
                        onClick={handleComment}
                      />
                    ) : (
                      <Button label="Envoyer" outlined rounded disabled />
                    )}
                  </div>
                  {comments ? (
                    <ul>
                      {comments.map((comment, index) => (
                        <Comment
                          key={index}
                          name={comment.participant}
                          content={comment.content}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p>Aucun commentaire n'a encore été publié</p> // Render a message if no comments are available
                  )}
                </section> */}
              </div>
            )}
          </article>
        </div>
      </main>
    </div>
  );
}
