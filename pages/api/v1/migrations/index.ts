import { NextApiRequest, NextApiResponse } from "next";
import migrationRunner from "node-pg-migrate";
import { MigrationDirection } from "node-pg-migrate/dist/types";
import { resolve } from "node:path";
import database from "@infra/database";
import { createRouter } from "next-connect";
import { InternalServerError, MethodNotAllowedError } from "@infra/errors";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(getHandler);
router.post(postHandler);

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
});

function onNoMatchHandler(request: NextApiRequest, response: NextApiResponse) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(
  error: unknown,
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.log("\n Erro dentro do catch do next-connect:");
  console.error(publicErrorObject);

  response.status(500).json(publicErrorObject);
}

async function getHandler(request: NextApiRequest, response: NextApiResponse) {
  let dbClient;
  dbClient = await database.getNewClient();
  const defaultMigrationOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: resolve("infra", "migrations"),
    direction: "up" as MigrationDirection,
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  const pendingMigrations = await migrationRunner(defaultMigrationOptions);
  return response.status(200).json(pendingMigrations);
}

async function postHandler(request: NextApiRequest, response: NextApiResponse) {
  let dbClient;
  dbClient = await database.getNewClient();
  const defaultMigrationOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: resolve("infra", "migrations"),
    direction: "up" as MigrationDirection,
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  const migratedMigrations = await migrationRunner({
    ...defaultMigrationOptions,
    dryRun: false,
  });

  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations);
  }
  return response.status(200).json(migratedMigrations);
}
