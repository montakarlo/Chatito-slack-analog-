import { getCustomRepository } from 'typeorm';
import PostRepository from '../data/repositories/postRepository';
import UserRepository from '../data/repositories/userRepository';
import PostReactionRepository from '../data/repositories/postReactionRepository';
import { ICreatePost } from '../common/models/post/ICreatePost';
import { IEditPost } from '../common/models/post/IEditPost';
import { IPost } from '../common/models/post/IPost';
import { ICreateComment } from '../common/models/comment/ICreateComment';
import ChatRepository from '../data/repositories/chatRepository';
import { fromPostToPostClient } from '../common/mappers/post';
import CommentRepository from '../data/repositories/commentRepository';
import { fromPostCommentsToPostCommentsClient } from '../common/mappers/comment';
import { emitToChatRoom } from '../common/utils/socketHelper';
import { ClientSockets } from '../common/enums/ClientSockets';
import { fromUserToUserClient } from '../common/mappers/user';

export const addPost = async (id: string, post: ICreatePost) => {
  const user = await getCustomRepository(UserRepository).getById(id);
  const chat = await getCustomRepository(ChatRepository).getById(post.chatId);
  const newPost: ICreatePost = { ...post, createdByUser: user, chat };
  const createdPost: IPost = await getCustomRepository(PostRepository).addPost(newPost);
  const clientPost = await fromPostToPostClient(createdPost);
  emitToChatRoom(clientPost.chatId, ClientSockets.AddPost, clientPost);
  return clientPost;
};

export const editPost = async ({ id, text }: IEditPost) => {
  const editedPost: IPost = await getCustomRepository(PostRepository).editPost(id, text);
  const clientPost = await fromPostToPostClient(editedPost);
  emitToChatRoom(clientPost.chatId, ClientSockets.EditPost, clientPost);
  return clientPost;
};

export const addComment = async (userId: string, postId: string, { text }: { text: string }) => {
  const createComment: ICreateComment = {
    post: { id: postId },
    text,
    createdByUser: { id: userId }
  };
  const comment = await getCustomRepository(CommentRepository).addComment(createComment);
  const newComment = await getCustomRepository(CommentRepository).getById(comment.id);
  const user = fromUserToUserClient(newComment.createdByUser);
  const newClientComment = { ...newComment, createdByUser: user };
  const chatId = (await getCustomRepository(PostRepository).getByIdWithChat(newClientComment.postId)).chat.id;
  emitToChatRoom(chatId, ClientSockets.AddReply, newClientComment);
  return newClientComment;
};

export const getPostComments = async (postId: string) => {
  const comments = await getCustomRepository(CommentRepository).getAllPostComments(postId);
  return fromPostCommentsToPostCommentsClient(comments);
};

export const addReaction = (reaction: string, postId: string, userId: string) => (
  getCustomRepository(PostReactionRepository).addReaction({
    reaction,
    post: { id: postId },
    user: { id: userId }
  })
);

export const deleteReaction = (reaction: string, postId: string, userId: string) => (
  getCustomRepository(PostReactionRepository).deleteReaction({ reaction, postId, userId })
);
