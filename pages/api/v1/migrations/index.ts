import { NextApiRequest, NextApiResponse } from "next";
import migrationRunner from "node-pg-migrate";
import { MigrationDirection } from "node-pg-migrate/dist/types";
import { resolve } from "node:path";
import database from "@infra/database";

export default async function migrations(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method as string)) {
    return response.status(405).json({
      error: `Method "${request.method}" not allowed`,
    });
  }

  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const defaultMigrationOptions = {
      dbClient: dbClient,
      dryRun: true,
      dir: resolve("infra", "migrations"),
      direction: "up" as MigrationDirection,
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);
      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });

      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations);
      }
      return response.status(200).json(migratedMigrations);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient?.end();
  }
}
