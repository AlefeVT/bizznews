import { fetchAPI } from "@/utils/fetchAPI";
import { useQuery } from "@tanstack/react-query";

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-3xl w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Status do Sistema
        </h1>
        <UpdatedAt />
      </div>
    </div>
  );
}

function UpdatedAt() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["status", "/api/v1/status"],
    queryFn: fetchAPI,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <div className="text-center text-gray-500">Carregando dados...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500">Erro ao carregar dados.</div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500">
        Nenhum dado disponível no momento.
      </div>
    );
  }

  const { updated_at, dependencies } = data;
  const {
    database: {
      version,
      max_connections,
      opened_connections,
      latency,
      status: dbStatus,
    },
  } = dependencies;

  return (
    <div>
      <div className="text-sm text-gray-600 mb-4">
        Última atualização:{" "}
        <span className="font-medium text-gray-900">
          {new Date(updated_at).toLocaleString("pt-BR")}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatusCard title="Versão do Banco" value={version} />
        <StatusCard
          title="Status do Banco"
          value={dbStatus}
          valueClass={
            dbStatus === "healthy" ? "text-green-500" : "text-red-500"
          }
        />
        <StatusCard title="Conexões Disponíveis" value={max_connections} />
        <StatusCard title="Conexões Atuais" value={opened_connections} />
        <StatusCard title="Latência" value={`${latency}ms`} />
      </div>
    </div>
  );
}

type StatusCardProps = {
  title: string;
  value: string | number;
  valueClass?: string;
};

function StatusCard({
  title,
  value,
  valueClass = "text-gray-800",
}: StatusCardProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
      <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
      <p className={`text-lg font-bold mt-1 ${valueClass}`}>{value}</p>
    </div>
  );
}
