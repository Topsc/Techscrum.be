declare namespace Express {
  interface Request {
    dbConnection: any;
    dbName: string;
    userConnection: any;
    tenantId: string | null;
    dataConnectionPool: any;
    tenantsConnection: any;
  }
}
