import React, { useState, useEffect, MutableRefObject } from 'react';
import { connect } from 'react-redux';
import { Card, Media, Popover, OverlayTrigger } from 'react-bootstrap';
import dayjs from 'dayjs';
import styles from './styles.module.sass';
import { IPost } from 'common/models/post/IPost';
import { IUser } from 'common/models/user/IUser';
import ProfilePreview from 'containers/ProfilePreview/index';
import EmojiPopUp from 'components/EmojiPopUp';
import { countBy, toLower } from 'ramda';
import { IEmojiData } from 'emoji-picker-react';
import { addPostReactionRoutine, deletePostReactionRoutine } from 'containers/Post/routines';
import { IBindingCallback1 } from 'common/models/callback/IBindingCallback1';
import { IPostReactionRoutine } from 'common/models/postReaction/IPostReactionRoutine';
import { IAppState } from 'common/models/store';
import { PostType } from 'common/enums/PostType';
import { ModalTypes } from 'common/enums/ModalTypes';
import { showModalRoutine } from 'routines/modal';
import { IModalRoutine } from 'common/models/modal/IShowModalRoutine';
import {
  showUserProfileRoutine,
  readPostRoutine,
  markAsUnreadPostWithOptionRoutine,
  readCommentRoutine,
  markAsUnreadCommentWithOptionRoutine } from 'scenes/Workspace/routines';
import ReminderItem from 'components/ReminderItem/ReminderItem';
import { IUnreadChat } from 'common/models/chat/IUnreadChats';
import { IPostsToRead } from 'common/models/chat/IPostsToRead';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { IMarkAsUnreadPost } from 'common/models/post/IMarkAsUnreadPost';
import { IUnreadPostComments } from 'common/models/post/IUnreadPostComments';
import { ICommentsToRead } from 'common/models/chat/ICommentsToRead';
import { IServerComment } from 'common/models/post/IServerComment';
import { IMarkAsUnreadComment } from 'common/models/post/IMarkAsUnreadComment';
import { IBindingAction } from 'common/models/callback/IBindingActions';
import JoinButton from 'scenes/Chat/components/JoinBtn';
import { MessageType } from 'common/enums/MessageType';
import { IntegrationType } from 'common/enums/IntegrationType';
import DOMPurify from 'dompurify';

interface IProps {
  post: IPost;
  isNew?: boolean;
  userId: string;
  type: PostType;
  openThread?: IBindingCallback1<IPost>;
  mainPostId?: string;
  addPostReaction: IBindingCallback1<IPostReactionRoutine>;
  deletePostReaction: IBindingCallback1<IPostReactionRoutine>;
  showUserProfile: IBindingCallback1<IUser>;
  showModal: IBindingCallback1<IModalRoutine>;
  unreadChats: IUnreadChat[];
  unreadPostComments: IUnreadPostComments[];
  readPost: IBindingCallback1<IPostsToRead>;
  readComment: IBindingCallback1<ICommentsToRead>;
  markAsUnreadPost: IBindingCallback1<IMarkAsUnreadPost>;
  markAsUnreadComment: IBindingCallback1<IMarkAsUnreadComment>;
  postRef?: MutableRefObject<any> | null;
  chatUsers?: IUser[];
}

const Post: React.FC<IProps> = ({ post: postData, isNew = false, userId, type, openThread,
  unreadPostComments, showUserProfile, addPostReaction, deletePostReaction, showModal, unreadChats,

  readPost, markAsUnreadPost, readComment, mainPostId, markAsUnreadComment, postRef, chatUsers }) => {
  const [post, setPost] = useState(postData);
  const [changedReaction, setChangedReaction] = useState('');
  useEffect(() => {
    setPost(postData);
  }, [postData]);
  useEffect(() => {
    if (changedReaction) {
      if (postData.postReactions.length < post.postReactions.length) {
        addPostReaction({ post, reaction: changedReaction });
      } else {
        deletePostReaction({ post, reaction: changedReaction });
      }
      setChangedReaction('');
    }
  }, [post]);

  const { createdByUser, text, postReactions } = post;
  const createdAt = new Date(post.createdAt);

  const twentyMinutes = 20 * 60000;
  const oneHour = twentyMinutes * 3;
  const threeHours = oneHour * 3;
  const oneDay = oneHour * 24;
  const oneWeek = oneDay * 7;

  const trigger = (onTriggerClick: IBindingAction, triggerRef: React.RefObject<HTMLButtonElement>) => (
    <button type="button" className={`${styles.reactBtn} button-unstyled`} onClick={onTriggerClick} ref={triggerRef}>
      React
    </button>
  );

  const onEmojiHandler = (emoji: string) => {
    setChangedReaction(emoji);

    setPost(state => {
      const userReactions = state.postReactions
        .filter(react => react.userId === userId)
        .map(react => react.reaction);

      if (userReactions.includes(emoji)) {
        return {
          ...state,
          postReactions: state.postReactions.filter(r => r.userId !== userId || r.reaction !== emoji)
        };
      }
      return {
        ...state,
        postReactions: [...state.postReactions, { reaction: emoji, userId }]
      };
    });
  };

  const onEmojiClick = (event: MouseEvent, emojiObject: IEmojiData) => {
    onEmojiHandler(emojiObject.emoji);
    document.body.click();
  };

  const countEmojis = (emojis: string[]) => countBy(toLower)(emojis);

  const renderEmojis = () => {
    const userReactions = postReactions
      .filter(react => react.userId === userId)
      .map(react => react.reaction);
    const emojis = postReactions.map(postReaction => postReaction.reaction);
    const countedEmojis = countEmojis(emojis);

    return Object.keys(countedEmojis).map(emoji => {
      const emojiStyles = [styles.emojiStatItem, userReactions.includes(emoji) ? styles.active : ''];
      return (
        <button type="button" key={emoji} className={emojiStyles.join(' ')} onClick={() => onEmojiHandler(emoji)}>
          <span className={styles.emoji}>{emoji}</span>
          <span>{countedEmojis[emoji]}</span>
        </button>
      );
    });
  };

  const popoverRemindOptions = (
    <Popover id="popover-basic" className={styles.popOverOptions}>
      <ReminderItem
        text="In 20 minutes"
        addedTime={twentyMinutes}
      />
      <ReminderItem
        text="In 1 hour"
        addedTime={oneHour}
      />
      <ReminderItem
        text="In 3 hours"
        addedTime={threeHours}
      />
      <ReminderItem
        text="Tomorrow"
        addedTime={oneDay}
      />
      <ReminderItem
        text="Next week"
        addedTime={oneWeek}
      />
      <button
        type="button"
        className={styles.optionsSelect}
        onClick={() => showModal({ modalType: ModalTypes.SetReminder, show: true })}
      >
        <span>Custom</span>
      </button>
    </Popover>
  );

  const markAsUnreadOptionClick = () => {
    if (type === PostType.Post) {
      markAsUnreadPost({ unreadPost: post });
    } else if (mainPostId) {
      markAsUnreadComment({ postId: mainPostId, unreadComment: post });
    }
    document.body.click();
  };

  const popoverOptions = (
    <Popover id="popover-basic" className={styles.popOverOptions}>
      <button
        type="button"
        className={styles.optionsSelect}
        onClick={markAsUnreadOptionClick}
      >
        <span>Mark as unread</span>
      </button>
      <OverlayTrigger
        // delay={{ show: 0, hide: Infinity }}
        trigger="click"
        placement="left"
        overlay={popoverRemindOptions}
      >
        <button type="button" className={styles.optionsSelect}>
          <span>Remind about that</span>
        </button>
      </OverlayTrigger>
    </Popover>
  );

  const ButtonOptions = () => (
    <OverlayTrigger trigger="click" rootClose placement="left" overlay={popoverOptions}>
      <Card.Link
        bsPrefix={styles.optionsBlock}
      >
        <FontAwesomeIcon icon={faEllipsisV} className={styles.optionsIcon} />
      </Card.Link>
    </OverlayTrigger>
  );

  const postsToRead = (id: string) => {
    const postId = id;
    const unreadChatsCopy = [...unreadChats];
    let postsToDelete: IPost[] = [];
    const postIdsToDelete: string[] = [];
    unreadChatsCopy.forEach((unreadChat, chatIndex) => {
      const unreadPostCopy = unreadChat.unreadPosts;
      unreadChat.unreadPosts.forEach((unreadPost, index) => {
        if (unreadPost.id === postId) {
          postsToDelete = [...unreadPostCopy.splice(0, index + 1)];
        }
      });
      unreadChatsCopy[chatIndex].unreadPosts = [...unreadPostCopy];
    });
    postsToDelete.forEach(postToDelete => {
      postIdsToDelete.push(postToDelete.id);
    });
    readPost({ postIdsToDelete, unreadChatsCopy });
  };

  const commentsToRead = (id: string) => {
    const commentId = id;
    const unreadCommentsCopy = [...unreadPostComments];
    let commentsToDelete: IServerComment[] = [];
    const commentIdsToDelete: string[] = [];
    unreadCommentsCopy.forEach((unreadChat, chatIndex) => {
      const unreadCommentCopy = unreadChat.unreadComments;
      unreadChat.unreadComments.forEach((unreadComment, index) => {
        if (unreadComment.id === commentId) {
          commentsToDelete = [...unreadCommentCopy.splice(0, index + 1)];
        }
      });
      unreadCommentsCopy[chatIndex].unreadComments = [...unreadCommentCopy];
    });
    commentsToDelete.forEach(commentToDelete => {
      commentIdsToDelete.push(commentToDelete.id);
    });
    readComment({ commentIdsToDelete, unreadCommentsCopy });
  };

  const onHoverRead = () => {
    if (type === PostType.Post) {
      unreadChats.forEach(unreadChat => {
        unreadChat.unreadPosts.forEach(unreadPost => {
          if (unreadPost.id === post.id) {
            postsToRead(unreadPost.id);
          }
        });
      });
    } else {
      unreadPostComments.forEach(UnreadPost => {
        if (UnreadPost.id === mainPostId) {
          UnreadPost.unreadComments.forEach(unreadComment => {
            if (unreadComment.id === post.id) {
              commentsToRead(unreadComment.id);
            }
          });
        }
      });
    }
  };
  const copyToClipBoard = async () => {
    const chatHash = post.chat?.hash as string;
    const url = window.location.href;
    const baseChatUrl = url.substring(0, url.indexOf(chatHash) + chatHash?.length);
    await navigator.clipboard.writeText(`${baseChatUrl}/${post.id}`);
  };
  const isJoinBtn = post.integration === IntegrationType.Whale && post.type !== MessageType.WhaleSignUpUser;

  return (
    <div ref={postRef}>
      <Media className={styles.postWrapper} onMouseEnter={onHoverRead}>
        <ProfilePreview tempUser={createdByUser} openProfile={showUserProfile} />
        <Media.Body bsPrefix={styles.body}>
          <button
            onClick={() => showUserProfile(createdByUser)}
            className={`${styles.author} button-unstyled`}
            type="button"
          >
            {createdByUser.fullName}
          </button>

          <br />

          <button
            type="button"
            className={`${styles.metadata} ${styles.tooltip}`}
            onClick={copyToClipBoard}
          >
            {dayjs(createdAt).format('hh:mm A')}
            <span className={styles.tooltipText}>Click here to copy message link</span>
          </button>
          {/* eslint-disable-next-line */}
          {
            isJoinBtn
              ? (
                <JoinButton
                  url={text}
                  creator={chatUsers?.find(user => user.id === post.createdByUser?.originalUserId)?.displayName}
                />
              )
              : (
                <div
                  className={`${styles.text} ${isNew ? styles.unread : ''}`}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text) }}
                />
              )
          }
          <div className={styles.emojiStats}>
            {type === PostType.Post && renderEmojis()}
          </div>
          <div className={styles.footer}>
            {openThread && (
              <Card.Link
                bsPrefix={styles.openThreadBtn}
                onClick={() => openThread(post)}
              >
                Reply
              </Card.Link>
            )}
            {type === PostType.Post && <EmojiPopUp trigger={trigger} onEmojiClick={onEmojiClick} />}
          </div>
          <ButtonOptions />
        </Media.Body>
      </Media>
    </div>
  );
};

const mapStateToProps = (state: IAppState) => ({
  userId: state.user.user?.id as string,
  unreadChats: state.workspace.unreadChats,
  unreadPostComments: state.workspace.unreadPostComments,
  chatUsers: state.chat.chat?.users
});

const mapDispatchToProps = {
  addPostReaction: addPostReactionRoutine,
  deletePostReaction: deletePostReactionRoutine,
  showModal: showModalRoutine,
  showUserProfile: showUserProfileRoutine,
  readPost: readPostRoutine,
  readComment: readCommentRoutine,
  markAsUnreadPost: markAsUnreadPostWithOptionRoutine,
  markAsUnreadComment: markAsUnreadCommentWithOptionRoutine
};

export default connect(mapStateToProps, mapDispatchToProps)(Post);
