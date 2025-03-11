import bcrypt from "bcryptjs"; //check for bcryptjs if this is working or not. If not, change it back to bcrypt or rewrite the encrypt code.

const saltRounds = 10;

export const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(saltRounds);
  return bcrypt.hashSync(password, salt);
}; //we need plain password and salt round to hash how much time needed for hash so more round you want that's gonna increase complexity. (recommended 10 rounds)

export const comparePassword = (
  plain,
  hashed //this is for comparing passwords(bcrypt has a built-in func for that.)
) => bcrypt.compareSync(plain, hashed);
