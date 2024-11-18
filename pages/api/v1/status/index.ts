import { NextApiRequest, NextApiResponse } from "next";
import database from "../../../../infra/database";

async function status(request: NextApiRequest, response: NextApiResponse) {
  const updatedAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version");
  const databaseVersionValue = databaseVersionResult?.rows[0].server_version;

  const databaseMaxConnectionsResult = await database.query(
    "SHOW max_connections;",
  );
  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult?.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConectionsResult = await database.query({
    text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1",
    values: [databaseName],
  });

  const databaseOpenedConectionsValue =
    databaseOpenedConectionsResult?.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(databaseMaxConnectionsValue),
        opened_connections: databaseOpenedConectionsValue,
      },
    },
  });
}

export default status;
