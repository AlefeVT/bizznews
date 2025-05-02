import bcryptjs from 'bcryptjs';

const ROUNDS: number = process.env.NODE_ENV === "production" ? 14 : 1;
const PEPPER: string = process.env.PEPPER || "";

async function hash(password: string): Promise<string> {
  return await bcryptjs.hash(addPepper(password), ROUNDS); 
}

async function compare(providedPassword: string, storedPassword: string): Promise<boolean> {
  return await bcryptjs.compare(addPepper(providedPassword), storedPassword);
}

function addPepper(password: string): string {
  return password + PEPPER;
}

const password = {
  hash,
  compare,
  addPepper,
};

export default password;
