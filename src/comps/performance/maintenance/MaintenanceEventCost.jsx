import hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { Button } from "@blueprintjs/core"

export function MaintenanceEventCosts({ maintenance_event_tag }) {


  const { data: maintenance_event_cost, isSuccess, isError, error } =
        hooks.maintenance.useGetMaintenanceEventCosts({ maintenance_event_tag },{ enabled: _.isString(maintenance_event_tag) });

  if (isError) console.log(error);
  console.log(maintenance_event_tag, maintenance_event_cost)


  return (
            <div>
                <div>Cost:</div>
                {isSuccess ? <div>{maintenance_event_cost} </div>:null}
            </div>
        );

    }
