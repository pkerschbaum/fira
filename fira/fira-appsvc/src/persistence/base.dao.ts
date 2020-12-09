import { PrismaClient } from '@fira-commons/database/prisma';

export type AvailableEntities =
  | 'config'
  | 'user'
  | 'document'
  | 'document_version'
  | 'query'
  | 'query_version'
  | 'judgement'
  | 'judgement_pair'
  | 'feedback';

// methods taken from https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/crud

export class BaseDAO<ENTITY extends AvailableEntities> {
  constructor(private readonly ENTITY: ENTITY, protected readonly prisma: PrismaClient) {}

  public findOne: PrismaClient[ENTITY]['findOne'] = (args: any) =>
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.prisma[this.ENTITY].findOne(args) as any;

  public findFirst: PrismaClient[ENTITY]['findFirst'] = (args: any) =>
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.prisma[this.ENTITY].findFirst(args) as any;

  public findMany: PrismaClient[ENTITY]['findMany'] = (args: any) =>
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.prisma[this.ENTITY].findMany(args) as any;

  public create: PrismaClient[ENTITY]['create'] = (args: any) =>
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.prisma[this.ENTITY].create(args) as any;

  public update: PrismaClient[ENTITY]['update'] = (args: any) =>
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.prisma[this.ENTITY].update(args) as any;

  public upsert: PrismaClient[ENTITY]['upsert'] = (args: any) =>
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.prisma[this.ENTITY].upsert(args) as any;

  public delete: PrismaClient[ENTITY]['delete'] = (args: any) =>
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.prisma[this.ENTITY].delete(args) as any;

  public updateMany: PrismaClient[ENTITY]['updateMany'] = (args: any) =>
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.prisma[this.ENTITY].updateMany(args) as any;

  public deleteMany: PrismaClient[ENTITY]['deleteMany'] = (args: any) =>
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.prisma[this.ENTITY].deleteMany(args) as any;

  public count: PrismaClient[ENTITY]['count'] = (args: any) =>
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.prisma[this.ENTITY].count(args) as any;

  public aggregate: PrismaClient[ENTITY]['aggregate'] = (args: any) =>
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.prisma[this.ENTITY].aggregate(args) as any;
}
