import hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { Button } from "@blueprintjs/core"
import { Costs } from "../instruments/Costs";

export function MaintenanceEventCosts({ maintenance_event_tag }) {


  const { data: maintenance_event_cost, isSuccess, isError, error } =
        hooks.maintenance.useGetMaintenanceEventCosts({ maintenance_event_tag },{ enabled: _.isString(maintenance_event_tag) });

  if (isError) console.log(error);


  return (
            <div className="flex center-items padding--little">
                <div>Cost:</div>
                {isSuccess ? <Costs amount={maintenance_event_cost} /> :null}
            </div>
        );

    }
