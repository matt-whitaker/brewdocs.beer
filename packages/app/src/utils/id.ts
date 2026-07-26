import { v4 as uuidV4 } from "uuid";

/** sync id generator — storage.generateId() is async and unsuitable for minting ids inline while walking a brewable */
export const newId = (): string => uuidV4();
