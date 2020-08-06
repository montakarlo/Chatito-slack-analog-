import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entities/UserEntity';
import { ICreateUser } from '../../common/models/user/ICreateUser';
import { IUserClient } from '../../common/models/user/IUserClient';

@EntityRepository(User)
class UserRepository extends Repository<User> {
  async addUser(data: ICreateUser): Promise<User> {
    const user = this.create(data);
    await user.save();

    return user;
  }

  getById(id: string): Promise<User> {
    return this.findOne(id);
  }

  async deleteUser(id: string): Promise<User> {
    const user = await this.getById(id);
    const data = { id };
    await user.remove({ data });

    return user;
  }

  async editUser(id:string, data: IUserClient): Promise<User> {
    await this.update(
      id,
      data
    );

    const user = await this.findOne(id);
    return user;
  }
}

export default UserRepository;
