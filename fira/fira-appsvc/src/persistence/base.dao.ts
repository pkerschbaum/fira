import { PrismaClient } from '../../../fira-commons/database/prisma';

export type AvailableEntities = 'config';

export class BaseDAO<ENTITY extends AvailableEntities> {
  constructor(private readonly ENTITY: ENTITY, private readonly prisma: PrismaClient) {}

  public findOne: PrismaClient[ENTITY]['findOne'] = (findArgs: any) =>
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.prisma[this.ENTITY].findOne(findArgs) as any;

  public findMany: PrismaClient[ENTITY]['findMany'] = (findArgs: any) =>
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.prisma[this.ENTITY].findMany(findArgs) as any;

  public create: PrismaClient[ENTITY]['create'] = (createArgs: any) =>
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.prisma[this.ENTITY].create(createArgs) as any;

  public update: PrismaClient[ENTITY]['update'] = (updateArgs: any) =>
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.prisma[this.ENTITY].update(updateArgs) as any;

  public delete: PrismaClient[ENTITY]['deleteMany'] = (deleteArgs: any) =>
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.prisma[this.ENTITY].deleteMany(deleteArgs) as any;

  public count: PrismaClient[ENTITY]['count'] = (findArgs: any) =>
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.prisma[this.ENTITY].count(findArgs) as any;
}
