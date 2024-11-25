import { NextApiRequest, NextApiResponse } from "next";
import database from "../../../../infra/database";

async function status(request: NextApiRequest, response: NextApiResponse) {
  const updatedAt = new Date().toISOString();

  try {
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
  } catch (error) {
    console.error("Erro ao coletar status do banco de dados:", error);
    response.status(500).json({
      error: "Erro ao coletar informações de status do banco de dados",
    });
  }
}

export default status;
