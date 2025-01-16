import { createRouter } from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import database from "../../../../infra/database";
import { InternalServerError, MethodNotAllowedError } from "@infra/errors";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(getHandler);

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
  const updatedAt = new Date().toISOString();
  const databaseVersionResult = await database.query("SHOW server_version");
  const databaseVersionValue = databaseVersionResult?.rows[0].server_version;

  const databaseMaxConnectionsResult = await database.query(
    "SHOW max_connections;",
  );
  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult?.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnectionsResult = await database.query({
    text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1",
    values: [databaseName],
  });

  const databaseOpenedConnectionsValue =
    databaseOpenedConnectionsResult?.rows[0].count;

  const latencyResults: number[] = [];
  for (let i = 0; i < 3; i++) {
    const start = process.hrtime.bigint();
    await database.query("SELECT 1");
    const end = process.hrtime.bigint();
    const latency = Number((end - start) / BigInt(1_000_000));
    latencyResults.push(latency);
  }

  const databaseStatus =
    databaseOpenedConnectionsValue < databaseMaxConnectionsValue * 0.8
      ? "healthy"
      : "unhealthy";

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(databaseMaxConnectionsValue),
        opened_connections: databaseOpenedConnectionsValue,
        latency: latencyResults,
        status: databaseStatus,
      },
    },
  });
}
