import api from 'common/helpers/apiHelper';
import { ICreateChat } from 'common/models/chat/ICreateChat';
import { ICreatePost } from 'common/models/post/ICreatePost';
import { IFetchMorePosts } from 'common/models/post/IFetchMorePosts';

export async function createChat(payload: ICreateChat) {
  const response = await api.post('/api/chats', payload);
  return response;
}

export async function fetchUserChats() {
  const response = await api.get('/api/chats');
  return response;
}

export async function fetchChatPosts({ chatId, from, count }: IFetchMorePosts) {
  const response = await api.get(`/api/chats/${chatId}/posts`, { from, count });
  return response;
}

export async function fetchChatUsers(chatId: string) {
  const response = await api.get(`/api/chats/${chatId}/users`);
  return response;
}

export async function removeUserFromChat(chatId: string, userId: string) {
  const response = await api.delete(`/api/chats/${chatId}/users/${userId}`);
  return response;
}

export async function addPost({ chatId, text }: ICreatePost) {
  const response = await api.post('/api/posts', { text, chatId });
  return response;
}