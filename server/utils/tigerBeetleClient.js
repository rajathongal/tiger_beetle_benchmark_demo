import { createClient } from "tigerbeetle-node";

const TigerBeetleClient = () => {
  return createClient({
      cluster_id: 0n,
      replica_addresses: [process.env.TB_ADDRESS || "3000"],
    });
};

export default TigerBeetleClient();