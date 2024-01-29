import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const generateUUID = () => {
  const randomBytes = crypto.randomBytes(16); // Secure random bytes
  const hexString = randomBytes.toString("hex"); // Convert to hex string
  const generatedUuidv4 = uuidv4(hexString); // Generate UUIDv4 from hex string
  return BigInt(`0x${generatedUuidv4.replace(/-/g, "")}`);
};

export default generateUUID;
