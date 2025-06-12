import { NotFoundError, UnauthorizedError } from "@infra/errors";
import password from "./password";
import user from "./user";

interface User {
  id: string;
  email: string;
  password: string;
}

interface ErrorParams {
  message: string;
  action: string;
}

async function getAuthenticatedUser(
  providedEmail: string,
  providedPassword: string,
): Promise<User> {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
      } as ErrorParams);
    }
    throw error;
  }
}

async function findUserByEmail(providedEmail: string): Promise<User> {
  let storedUser: User;

  try {
    storedUser = await user.findOneByEmail(providedEmail);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError({
        message: "Email não confere.",
        action: "Verifique se este dado está correto.",
      } as ErrorParams);
    }

    throw error;
  }

  return storedUser;
}

async function validatePassword(
  providedPassword: string,
  storedPassword: string,
): Promise<void> {
  const correctPasswordMatch: boolean = await password.compare(
    providedPassword,
    storedPassword,
  );

  if (!correctPasswordMatch) {
    throw new UnauthorizedError({
      message: "Senha não confere.",
      action: "Verifique se este dado está correto.",
    } as ErrorParams);
  }
}

const authentication = {
  getAuthenticatedUser,
} as const;

export default authentication;
