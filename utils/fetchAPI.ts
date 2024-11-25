import { QueryFunctionContext } from "@tanstack/react-query";

export async function fetchAPI({
  queryKey,
}: QueryFunctionContext<[string, string]>) {
  const [, key] = queryKey;
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}
