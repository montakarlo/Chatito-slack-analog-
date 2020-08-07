import { Entity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { AbstractEntity } from '../abstract/AbstractEntity';
import { User } from './User';
import { Post } from './Post';

@Entity()
export class Comment extends AbstractEntity {
  @Column()
  text: string;

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser: User;

  @RelationId((comment: Comment) => comment.createdByUser)
  readonly createdByUserId: string;

  @ManyToOne(() => Post, post => post.comments)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @RelationId((comment: Comment) => comment.post)
  readonly postId: string;
}