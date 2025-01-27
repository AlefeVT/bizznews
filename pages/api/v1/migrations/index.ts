import { NextApiRequest, NextApiResponse } from "next";
import migrationRunner from "node-pg-migrate";
import { MigrationDirection } from "node-pg-migrate/dist/types";
import { resolve } from "node:path";
import database from "@infra/database";
import { createRouter } from "next-connect";
import controller from "@infra/controller";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up" as MigrationDirection,
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function getHandler(request: NextApiRequest, response: NextApiResponse) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
    });
    return response.status(200).json(pendingMigrations);
  } finally {
    await dbClient?.end();
  }
}

async function postHandler(request: NextApiRequest, response: NextApiResponse) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }
    return response.status(200).json(migratedMigrations);
  } finally {
    await dbClient?.end();
  }
}
