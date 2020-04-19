import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

import { TUser, User } from './entity/user.entity';
import { failIfUndefined } from './persistence.util';

@Injectable()
export class UserDAO {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public findUser = async (
    criteria: { id: TUser['id'] },
    transactionalEM?: EntityManager,
  ): Promise<User | undefined> => {
    const repository =
      transactionalEM !== undefined ? transactionalEM.getRepository(User) : this.userRepository;

    return await repository.findOne(criteria.id);
  };

  public findUserOrFail = failIfUndefined(this.findUser);

  public findUsers = async (criteria: { ids: Array<User['id']> }): Promise<User[]> => {
    return await this.userRepository.findByIds(criteria.ids);
  };

  public saveUser = async (data: Pick<TUser, 'id'>): Promise<void> => {
    const dbEntry = new User();
    dbEntry.id = data.id;
    await this.userRepository.save(dbEntry);
  };

  public count = async (): Promise<number> => {
    return await this.userRepository.count();
  };
}
