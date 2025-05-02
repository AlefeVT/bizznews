import database from "@infra/database";
import { NotFoundError, ValidationError } from "@infra/errors";
import password from "./password";

interface UserInputValues {
  username: string;
  email: string;
  password: string;
}

interface UserDatabaseRow {
  id: string;
  username: string;
  email: string;
  password: string;
}

async function findOneByUsername(username: string) {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username: string) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT
          1
        ;`,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
      });
    }

    return results.rows[0];
  }
}

async function create(userInputValues: UserInputValues) {
  await validateUniqueUsername(userInputValues.username);
  await validateUniqueEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues: UserInputValues) {
    const results = await database.query({
      text: `
        INSERT INTO 
          users (username, email, password) 
        VALUES 
          ($1, $2, $3)
        RETURNING
          *
      ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });

    return results.rows[0];
  }
}

async function update(username: string, userInputValues: UserInputValues) {
  const currentUser = await findOneByUsername(username)

  if("username" in userInputValues) {
    await validateUniqueUsername(userInputValues.username)
  }

  if("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email)
  }

  if("password" in userInputValues) {
    await hashPasswordInObject(userInputValues)
  }

  const userWithNewValues = {...currentUser, ...userInputValues}

  const updatedUser = await runUpdateQuery(userWithNewValues)
  return updatedUser

  async function runUpdateQuery(userWithNewValues: UserDatabaseRow) {
    const results = await database.query({
      text: `
        UPDATE
          users
        SET
          username = $2,
          email = $3,
          password = $4,
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      `,
      values: [
        userWithNewValues.id, 
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password
      ]
    })

    return results.rows[0]
  }
}

async function validateUniqueUsername(username: string) {
  const results = await database.query({
    text: `
      SELECT 
        username
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
    ;`,
    values: [username],
  });

  if (results.rowCount! > 0) {
    throw new ValidationError({
      message: "O username informado já está sendo utilizado.",
      action: "Utilize outro username para realizar esta operação.",
    });
  }
}

async function validateUniqueEmail(email: string) {
  const results = await database.query({
    text: `
      SELECT 
        email
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
    ;`,
    values: [email],
  });

  if (results.rowCount! > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar esta operação.",
    });
  }
}

async function hashPasswordInObject(userInputValues: UserInputValues) {
  const hashedPassword = await password.hash(userInputValues.password)
  userInputValues.password = hashedPassword
}

const user = {
  create,
  findOneByUsername,
  update
};

export default user;
