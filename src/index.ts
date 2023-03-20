require("dotenv").config();

import { snapshot_dispatchSpokes } from "./dispatchSpokes";
import { snapshot_propose } from "./main-scripts/propose";
import { snapshot_monitorPropose } from "./main-scripts/monitorPropose";
import { snapshot_finalize } from "./main-scripts/finalize";

const arg = process.argv[2];

if (arg) {
  console.log(`Running with arg ${arg}`);
} else {
  console.error(`No arg given`);
}

if (arg == "snapshot-propose") {
  snapshot_propose();
} else if (arg == "snapshot-monitor-propose") {
  snapshot_monitorPropose();
} else if (arg == "snapshot-dispatch") {
  snapshot_dispatchSpokes();
} else if (arg == "snapshot-finalize") {
  snapshot_finalize();
} else {
  console.error(`No running script for ${arg}`);
  process.exit();
}
