import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TUser, User } from './entity/user.entity';
import { failIfUndefined, optionalTransaction, DAO } from './persistence.util';

@Injectable()
export class UserDAO implements DAO<User> {
  constructor(
    @InjectRepository(User)
    public readonly repository: Repository<User>,
  ) {}

  public findUser = optionalTransaction(User)(
    async (
      { criteria }: { criteria: { id: TUser['id'] } },
      repository,
    ): Promise<User | undefined> => {
      return await repository.findOne(criteria.id);
    },
  );

  public findUserOrFail = failIfUndefined(this.findUser);

  public findUsers = async (criteria: { ids: Array<User['id']> }): Promise<User[]> => {
    return await this.repository.findByIds(criteria.ids);
  };

  public saveUser = async (data: Pick<TUser, 'id'>): Promise<void> => {
    const dbEntry = new User();
    dbEntry.id = data.id;
    await this.repository.save(dbEntry);
  };

  public count = async (): Promise<number> => {
    return await this.repository.count();
  };
}
